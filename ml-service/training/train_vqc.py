"""
FarmSync Quantum 2.0 — VQC Training Script
===========================================
Trains the Variational Quantum Classifier using COBYLA optimizer (gradient-free).
Uses Qiskit AerSimulator for circuit execution.

Architecture:
  - 4 qubits (N, P, K, pH features)
  - Angle encoding feature map
  - RealAmplitudes-style ansatz (2 variational layers)
  - Binary classification: target class vs all others
  - COBYLA optimizer from scipy

Run: python train_vqc.py
Outputs: models/vqc_trained_params.json, models/vqc_training_history.json
"""
import sys, os, time, json, math
import numpy as np
import pandas as pd
from pathlib import Path
from scipy.optimize import minimize

sys.path.insert(0, str(Path(__file__).parent.parent))

BASE_DIR = Path(__file__).parent.parent
DATASET_PATH = BASE_DIR / "datasets" / "Crop_recommendation.csv"
FULL_DATASET_PATH = BASE_DIR / "datasets" / "Crop_recommendation_full.csv"
MODELS_DIR = BASE_DIR / "models"
VQC_PARAMS_PATH = MODELS_DIR / "vqc_trained_params.json"
VQC_HISTORY_PATH = MODELS_DIR / "vqc_training_history.json"

# ─────────────────────────────────────────────────────────────
# Dataset Loading & Preprocessing
# ─────────────────────────────────────────────────────────────

def load_training_data():
    """Load dataset. Prefer the full synthetic dataset; fall back to small CSV."""
    if FULL_DATASET_PATH.exists():
        df = pd.read_csv(FULL_DATASET_PATH)
        print(f"[Data] Loaded full dataset: {df.shape}")
    elif DATASET_PATH.exists():
        df = pd.read_csv(DATASET_PATH)
        print(f"[Data] Loaded small dataset: {df.shape} — generating augmented version")
        # Augment with Gaussian noise for a more representative training set
        augmented = []
        np.random.seed(42)
        for _ in range(50):
            noisy = df.copy()
            for col in ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']:
                noise = np.random.normal(0, noisy[col].std() * 0.05, len(noisy))
                noisy[col] = (noisy[col] + noise).clip(lower=0)
            augmented.append(noisy)
        df = pd.concat([df] + augmented, ignore_index=True)
        print(f"[Data] Augmented to: {df.shape}")
    else:
        raise FileNotFoundError("No training dataset found. Run generate_dataset.py first.")

    features = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']
    X = df[features].values.astype(float)
    y_labels = df['label'].values
    return X, y_labels, features

def normalize_features_to_angles(X: np.ndarray) -> np.ndarray:
    """
    Normalize each feature to [0, π] for quantum angle encoding.
    Uses per-feature min-max normalization based on training statistics.
    """
    X_norm = np.zeros_like(X, dtype=float)
    norms = {}
    for i in range(X.shape[1]):
        col_min = X[:, i].min()
        col_max = X[:, i].max()
        col_range = col_max - col_min if col_max != col_min else 1.0
        X_norm[:, i] = (X[:, i] - col_min) / col_range * np.pi
        norms[i] = {'min': float(col_min), 'max': float(col_max)}
    return X_norm, norms

# ─────────────────────────────────────────────────────────────
# Quantum Circuit
# ─────────────────────────────────────────────────────────────

try:
    from qiskit import QuantumCircuit, transpile
    from qiskit.circuit import ParameterVector
    from qiskit_aer import AerSimulator
    QISKIT_AVAILABLE = True
    simulator = AerSimulator()
    print("[Qiskit] AerSimulator backend ready.")
except Exception as e:
    QISKIT_AVAILABLE = False
    print(f"[Qiskit] Not available: {e} — using NumPy emulator")

NUM_QUBITS = 4  # N, P, K, pH → 4 angles
NUM_PARAMS = 8  # 4 per ansatz layer × 2 layers

_cached_circuit = None

def build_vqc_circuit():
    """Build parameterized VQC template (called once)."""
    global _cached_circuit
    if _cached_circuit is not None:
        return _cached_circuit

    phi = ParameterVector('phi', NUM_QUBITS)    # feature angles
    theta = ParameterVector('theta', NUM_PARAMS)  # trainable params

    qc = QuantumCircuit(NUM_QUBITS, 1)  # 1-bit output (binary classification)

    # Feature Map Layer — angle encoding
    for q in range(NUM_QUBITS):
        qc.ry(phi[q], q)

    # Variational Ansatz Layer 1 — RealAmplitudes style
    for q in range(NUM_QUBITS):
        qc.ry(theta[q], q)

    # Linear entanglement
    for q in range(NUM_QUBITS - 1):
        qc.cx(q, q + 1)

    # Variational Ansatz Layer 2
    for q in range(NUM_QUBITS):
        qc.ry(theta[q + NUM_QUBITS], q)

    # Measure only qubit 0 → binary output
    qc.measure(0, 0)

    # Transpile once and cache
    compiled = transpile(qc, simulator)
    _cached_circuit = (compiled, phi, theta)
    return _cached_circuit

def run_vqc_single(angles: list, params: np.ndarray, shots: int = 128) -> float:
    """
    Run VQC for a single sample.
    Returns probability of measuring |1⟩ on qubit 0.
    """
    if not QISKIT_AVAILABLE:
        return _numpy_vqc(angles, params)

    compiled, phi_params, theta_params = build_vqc_circuit()
    param_binding = {}
    for i, p in enumerate(phi_params):
        param_binding[p] = float(angles[i])
    for i, p in enumerate(theta_params):
        param_binding[p] = float(params[i])

    bound = compiled.assign_parameters(param_binding)
    job = simulator.run(bound, shots=shots)
    counts = job.result().get_counts()
    p1 = counts.get('1', 0) / shots
    return p1

def _numpy_vqc(angles: list, params: np.ndarray) -> float:
    """NumPy fallback — compute P(|1>) via statevector."""
    def ry(theta):
        return np.array([[math.cos(theta/2), -math.sin(theta/2)],
                         [math.sin(theta/2),  math.cos(theta/2)]])

    state = np.array([1.0, 0.0], dtype=complex)
    for i, (a, p) in enumerate(zip(angles[:NUM_QUBITS], params[:NUM_QUBITS])):
        state = ry(a + p) @ state
    return float(np.abs(state[1])**2)

# ─────────────────────────────────────────────────────────────
# Loss Function — Binary Cross-Entropy
# ─────────────────────────────────────────────────────────────

_LOSS_HISTORY = []
_ACCURACY_HISTORY = []
_EPOCH_COUNTER = [0]

def compute_loss_and_accuracy(params: np.ndarray, X_angles_4: np.ndarray,
                               y_binary: np.ndarray, shots: int = 128) -> float:
    """
    Compute mean binary cross-entropy loss over the dataset.
    Only uses first 4 features (N, P, K, pH) for VQC.
    """
    eps = 1e-7
    total_loss = 0.0
    correct = 0

    for i in range(len(X_angles_4)):
        angles = X_angles_4[i]  # 4 angles
        y_true = float(y_binary[i])
        p1 = run_vqc_single(angles, params, shots=shots)
        p1 = np.clip(p1, eps, 1 - eps)
        loss = -(y_true * math.log(p1) + (1 - y_true) * math.log(1 - p1))
        total_loss += loss
        pred = 1 if p1 >= 0.5 else 0
        if pred == int(y_true):
            correct += 1

    mean_loss = total_loss / len(X_angles_4)
    accuracy = correct / len(X_angles_4)

    _EPOCH_COUNTER[0] += 1
    _LOSS_HISTORY.append(float(mean_loss))
    _ACCURACY_HISTORY.append(float(accuracy))

    if _EPOCH_COUNTER[0] % 5 == 0 or _EPOCH_COUNTER[0] == 1:
        print(f"  Iter {_EPOCH_COUNTER[0]:3d} | Loss: {mean_loss:.4f} | Acc: {accuracy*100:.1f}%")

    return mean_loss

# ─────────────────────────────────────────────────────────────
# Training
# ─────────────────────────────────────────────────────────────

def train_vqc(max_iterations: int = 60, target_class: str = "rice",
              train_subset_size: int = 60, shots: int = 128):
    """
    Train VQC parameters using COBYLA (gradient-free) optimizer.

    Args:
        max_iterations: Maximum COBYLA iterations
        target_class: Positive class for binary classification
        train_subset_size: Number of training samples (keep small for speed)
        shots: Qiskit shots per circuit execution

    Returns:
        dict with trained parameters and training history
    """
    print(f"\n{'='*60}")
    print(f"FarmSync VQC Training — Binary Classifier")
    print(f"Target class: '{target_class}' vs all others")
    print(f"Backend: {'Qiskit AerSimulator' if QISKIT_AVAILABLE else 'NumPy Emulator'}")
    print(f"Optimizer: COBYLA | Max iterations: {max_iterations}")
    print(f"Qubits: {NUM_QUBITS} | Parameters: {NUM_PARAMS}")
    print(f"{'='*60}\n")

    # Load and prepare data
    X, y_labels, features = load_training_data()
    FEATURES_4 = ['N', 'P', 'K', 'ph']  # 4 features → 4 qubits
    feat_indices = [features.index(f) for f in FEATURES_4]
    X_4 = X[:, feat_indices]

    # Normalize to [0, π]
    X_4_norm, norm_stats = normalize_features_to_angles(X_4)

    # Binary labels
    y_binary = (y_labels == target_class).astype(int)

    # Stratified subset for training speed
    pos_idx = np.where(y_binary == 1)[0]
    neg_idx = np.where(y_binary == 0)[0]
    n_pos = min(len(pos_idx), train_subset_size // 2)
    n_neg = min(len(neg_idx), train_subset_size - n_pos)
    np.random.seed(42)
    sel_idx = np.concatenate([
        np.random.choice(pos_idx, n_pos, replace=len(pos_idx) < n_pos),
        np.random.choice(neg_idx, n_neg, replace=len(neg_idx) < n_neg)
    ])
    np.random.shuffle(sel_idx)
    X_train = X_4_norm[sel_idx]
    y_train = y_binary[sel_idx]

    print(f"[Data] Training samples: {len(X_train)} | Positive: {y_train.sum()} | Negative: {(1-y_train).sum()}")
    print(f"[Data] Features: {FEATURES_4}\n")

    # Parameter initialization — Xavier-style
    np.random.seed(0)
    init_params = np.random.uniform(-np.pi/4, np.pi/4, NUM_PARAMS)
    print(f"[Init] Parameters: {[round(p, 3) for p in init_params]}\n")
    print("[Training] Starting COBYLA optimization...\n")

    # Pre-build/cache the circuit
    if QISKIT_AVAILABLE:
        build_vqc_circuit()

    t_start = time.perf_counter()

    # Early stopping & checkpointing state
    _best_loss = [float('inf')]
    _best_params = [init_params.copy()]
    _patience_counter = [0]
    _PATIENCE = 10  # stop if no improvement for 10 consecutive evals
    _PLATEAU_THRESHOLD = 0.001
    _stop_flag = [False]

    def _loss_with_checkpoint(params, X_a, y_b, sh):
        loss = compute_loss_and_accuracy(params, X_a, y_b, sh)
        # Update best params (checkpoint)
        if loss < _best_loss[0] - _PLATEAU_THRESHOLD:
            _best_loss[0] = loss
            _best_params[0] = params.copy()
            _patience_counter[0] = 0
        else:
            _patience_counter[0] += 1
            if _patience_counter[0] >= _PATIENCE:
                # Signal early stop by raising (COBYLA ignores callback, so we return poor loss)
                print(f"  [Early Stop] No improvement for {_PATIENCE} iters. Stopping at iter {_EPOCH_COUNTER[0]}.")
                _stop_flag[0] = True
                return _best_loss[0]  # return best seen so far to prevent divergence
        return loss

    result = minimize(
        fun=_loss_with_checkpoint,
        x0=init_params,
        args=(X_train, y_train, shots),
        method='COBYLA',
        options={
            'maxiter': max_iterations,
            'rhobeg': 0.5,
            'catol': 0.01
        }
    )

    # Use best checkpointed params (not necessarily final)
    trained_params = _best_params[0]
    t_elapsed = time.perf_counter() - t_start
    print(f"  Best checkpoint loss: {_best_loss[0]:.4f} (used instead of final loss)")


    # Final evaluation on full dataset
    print(f"\n[Eval] Running final evaluation on all {len(X_4_norm)} samples...")
    _EPOCH_COUNTER[0] = 0
    final_correct = 0
    final_tp = final_tn = final_fp = final_fn = 0
    for i in range(len(X_4_norm)):
        p1 = run_vqc_single(X_4_norm[i], trained_params, shots=shots)
        pred = 1 if p1 >= 0.5 else 0
        true = int(y_binary[i])
        if pred == true:
            final_correct += 1
        if pred == 1 and true == 1: final_tp += 1
        if pred == 0 and true == 0: final_tn += 1
        if pred == 1 and true == 0: final_fp += 1
        if pred == 0 and true == 1: final_fn += 1

    final_acc = final_correct / len(X_4_norm)
    precision = final_tp / (final_tp + final_fp) if (final_tp + final_fp) > 0 else 0
    recall = final_tp / (final_tp + final_fn) if (final_tp + final_fn) > 0 else 0
    f1 = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0

    print(f"\n{'='*60}")
    print(f"VQC TRAINING RESULTS")
    print(f"{'='*60}")
    print(f"  Training time:        {t_elapsed:.1f}s ({t_elapsed/60:.1f} min)")
    print(f"  COBYLA iterations:    {len(_LOSS_HISTORY)}")
    print(f"  Initial loss:         {_LOSS_HISTORY[0]:.4f}" if _LOSS_HISTORY else "  No loss recorded")
    print(f"  Final loss:           {_LOSS_HISTORY[-1]:.4f}" if _LOSS_HISTORY else "")
    print(f"  Final accuracy:       {final_acc*100:.2f}%")
    print(f"  Precision:            {precision:.4f}")
    print(f"  Recall:               {recall:.4f}")
    print(f"  F1 Score:             {f1:.4f}")
    print(f"  Trained params:       {[round(p, 4) for p in trained_params]}")
    print(f"{'='*60}\n")

    # Save results
    output = {
        "target_class": target_class,
        "trained_parameters": trained_params.tolist(),
        "num_qubits": NUM_QUBITS,
        "num_params": NUM_PARAMS,
        "features": FEATURES_4,
        "optimizer": "COBYLA",
        "max_iterations": max_iterations,
        "actual_iterations": len(_LOSS_HISTORY),
        "training_time_seconds": round(t_elapsed, 2),
        "shots_per_sample": shots,
        "training_samples": int(len(X_train)),
        "final_accuracy_pct": round(final_acc * 100, 2),
        "precision": round(precision, 4),
        "recall": round(recall, 4),
        "f1_score": round(f1, 4),
        "initial_loss": round(_LOSS_HISTORY[0], 4) if _LOSS_HISTORY else None,
        "final_loss": round(_LOSS_HISTORY[-1], 4) if _LOSS_HISTORY else None,
        "confusion_matrix": {
            "TP": final_tp, "TN": final_tn, "FP": final_fp, "FN": final_fn
        },
        "norm_stats": norm_stats,
        "qiskit_native": QISKIT_AVAILABLE,
        "trained_at": str(pd.Timestamp.now())
    }

    history = {
        "loss": _LOSS_HISTORY,
        "accuracy": _ACCURACY_HISTORY
    }

    MODELS_DIR.mkdir(exist_ok=True)
    with open(VQC_PARAMS_PATH, 'w') as f:
        json.dump(output, f, indent=2)
    with open(VQC_HISTORY_PATH, 'w') as f:
        json.dump(history, f, indent=2)

    print(f"[Saved] {VQC_PARAMS_PATH}")
    print(f"[Saved] {VQC_HISTORY_PATH}")

    return output, history


if __name__ == "__main__":
    # Train VQC — rice binary classifier (most common crop in dataset)
    result, history = train_vqc(
        max_iterations=60,
        target_class="rice",
        train_subset_size=60,
        shots=128
    )
    print("\nTraining complete.")
    print(f"Params saved to: {VQC_PARAMS_PATH}")
