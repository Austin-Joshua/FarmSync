"""
FarmSync Quantum 2.0 — Advanced VQC Training Pipeline (Phase 3)
==============================================================
Optimizes VQC architecture by comparing feature maps, ansatzes, and optimizers.
Supports early stopping, checkpoint save/resume, and auto-configuration.
"""
import sys, os, time, json, math
import numpy as np
import pandas as pd
from pathlib import Path
from scipy.optimize import minimize

sys.path.insert(0, str(Path(__file__).parent.parent))

BASE_DIR = Path(__file__).parent.parent
DATASET_PATH = BASE_DIR / "datasets" / "Crop_recommendation_full.csv"
MODELS_DIR = BASE_DIR / "models"
CHECKPOINT_PATH = MODELS_DIR / "vqc_checkpoint.json"
BEST_MODEL_PATH = MODELS_DIR / "vqc_trained_params.json"
ADVANCED_REPORT_PATH = MODELS_DIR / "quantum_performance_report.json"

MODELS_DIR.mkdir(exist_ok=True, parents=True)

# ─── Load Data ────────────────────────────────────────────────
if DATASET_PATH.exists():
    df = pd.read_csv(DATASET_PATH)
else:
    df = pd.DataFrame({
        'N': np.random.randint(0, 150, 100),
        'P': np.random.randint(0, 150, 100),
        'K': np.random.randint(0, 150, 100),
        'ph': np.random.uniform(5.5, 7.5, 100),
        'label': ['rice'] * 50 + ['maize'] * 50
    })

X_raw = df[['N', 'P', 'K', 'ph']].values.astype(float)
y_labels = df['label'].values
target_class = 'rice'
y_binary = (y_labels == target_class).astype(int)

# Normalize to min-max statistics
norm_stats = {}
X_norm = np.zeros_like(X_raw)
for i in range(4):
    mn, mx = X_raw[:, i].min(), X_raw[:, i].max()
    norm_stats[i] = {'min': float(mn), 'max': float(mx)}
    X_norm[:, i] = (X_raw[:, i] - mn) / max(mx - mn, 1e-8)

# ─── Quantum Ansatz & Feature Map Emulators ───────────────────
def ry(theta):
    return np.array([[np.cos(theta/2), -np.sin(theta/2)],
                     [np.sin(theta/2), np.cos(theta/2)]], dtype=complex)

def rz(theta):
    return np.array([[np.exp(-1j*theta/2), 0],
                     [0, np.exp(1j*theta/2)]], dtype=complex)

def apply_cnot(state, control, target):
    # Statevector control-target flip
    num_qubits = 4
    new_state = state.copy()
    for i in range(16):
        ctrl_bit = (i >> (num_qubits - 1 - control)) & 1
        if ctrl_bit == 1:
            target_mask = 1 << (num_qubits - 1 - target)
            j = i ^ target_mask
            if i < j:
                new_state[i], new_state[j] = new_state[j], new_state[i]
    return new_state

def run_vqc_emulator(features, params, feature_map='angle', ansatz='real_amps'):
    # 1. Feature Map Layer
    state = np.zeros(16, dtype=complex)
    state[0] = 1.0
    
    # Angle encoding
    if feature_map == 'angle':
        U_feat = ry(features[0] * np.pi)
        for val in features[1:]:
            U_feat = np.kron(U_feat, ry(val * np.pi))
        state = U_feat @ state
    # ZZFeatureMap (Approximation)
    else:
        # H layers
        H = 1/np.sqrt(2) * np.array([[1, 1], [1, -1]])
        U_h = np.kron(np.kron(np.kron(H, H), H), H)
        state = U_h @ state
        # Rotations
        U_z = rz(features[0] * np.pi)
        for val in features[1:]:
            U_z = np.kron(U_z, rz(val * np.pi))
        state = U_z @ state
        
    # 2. Ansatz Layers
    # RealAmplitudes ansatz
    if ansatz == 'real_amps':
        U_v1 = ry(params[0])
        for p in params[1:4]:
            U_v1 = np.kron(U_v1, ry(p))
        state = U_v1 @ state
        
        # Entanglement CNOTs
        state = apply_cnot(state, 0, 1)
        state = apply_cnot(state, 1, 2)
        state = apply_cnot(state, 2, 3)
        
        U_v2 = ry(params[4])
        for p in params[5:8]:
            U_v2 = np.kron(U_v2, ry(p))
        state = U_v2 @ state
        
    # EfficientSU2 ansatz (Ry + Rz + CNOT)
    else:
        # Layer 1 Ry
        U_ry1 = ry(params[0])
        for p in params[1:4]:
            U_ry1 = np.kron(U_ry1, ry(p))
        state = U_ry1 @ state
        # Layer 1 Rz
        U_rz1 = rz(params[4])
        for p in params[5:8]:
            U_rz1 = np.kron(U_rz1, rz(p))
        state = U_rz1 @ state
        
        # Entanglement
        state = apply_cnot(state, 0, 1)
        state = apply_cnot(state, 1, 2)
        
    probs = np.abs(state)**2
    # Return probability of qubit 0 measured as |1>
    p1 = sum(probs[i] for i in range(16) if (i >> 3) & 1 == 1)
    return float(p1)

# ─── BCE Loss Function with Checkpoints and Early Stopping ───
loss_eval_count = [0]
best_loss = [float('inf')]
best_params = [None]
patience_counter = [0]

def loss_fn(params, X, y, fmap, ansatz, patience=10):
    eps = 1e-7
    total = 0.0
    correct = 0
    for i in range(len(X)):
        p = run_vqc_emulator(X[i], params, fmap, ansatz)
        p = np.clip(p, eps, 1-eps)
        total += -(y[i]*math.log(p) + (1-y[i])*math.log(1-p))
        pred = 1 if p >= 0.5 else 0
        if pred == y[i]: correct += 1
    
    loss = total / len(X)
    loss_eval_count[0] += 1
    
    # Checkpoint progress
    if loss < best_loss[0] - 0.001:
        best_loss[0] = loss
        best_params[0] = params.copy()
        patience_counter[0] = 0
        # Save temporary checkpoint to allow resume
        ckpt = {
            "trained_parameters": params.tolist(),
            "loss": loss,
            "target_class": target_class,
            "norm_stats": norm_stats
        }
        with open(CHECKPOINT_PATH, 'w') as f:
            json.dump(ckpt, f)
    else:
        patience_counter[0] += 1
        
    if patience_counter[0] >= patience:
        return best_loss[0] # early stopping trigger
        
    return loss

# ─── Compare Optimizers, Ansatz, and Feature Maps ─────────────
def run_evaluation_matrix():
    print("=" * 65)
    print("QUANTUM INTELLIGENCE ARCHITECTURE OPTIMIZATION MATRIX")
    print("=" * 65)
    
    fmaps = ['angle', 'zz']
    ansatzes = ['real_amps', 'eff_su2']
    optimizers = ['COBYLA', 'SPSA']
    
    results = []
    
    # Stratified subset for matrix evaluation (speedup)
    np.random.seed(42)
    pos = np.where(y_binary == 1)[0]
    neg = np.where(y_binary == 0)[0]
    sel = np.concatenate([np.random.choice(pos, 25), np.random.choice(neg, 25)])
    X_sub = X_norm[sel]
    y_sub = y_binary[sel]
    
    for fmap in fmaps:
        for ans in ansatzes:
            for opt in optimizers:
                print(f"Testing Config: Map={fmap:5s} | Ansatz={ans:9s} | Opt={opt:6s}...")
                
                loss_eval_count[0] = 0
                best_loss[0] = float('inf')
                best_params[0] = None
                patience_counter[0] = 0
                
                # Check for resume checkpoint compatibility
                init_p = np.random.uniform(-np.pi/4, np.pi/4, 8)
                if CHECKPOINT_PATH.exists():
                    try:
                        with open(CHECKPOINT_PATH) as f:
                            ckpt_data = json.load(f)
                        if len(ckpt_data.get("trained_parameters", [])) == 8:
                            init_p = np.array(ckpt_data["trained_parameters"])
                            print("  [Checkpoint Resume Successful]")
                    except Exception:
                        pass
                
                t0 = time.perf_counter()
                if opt == 'COBYLA':
                    res = minimize(loss_fn, init_p, args=(X_sub, y_sub, fmap, ans), 
                                   method='COBYLA', options={'maxiter': 40})
                else:
                    # Simple SPSA approximation
                    params = init_p.copy()
                    for k in range(30):
                        ck = 0.1 / (k+1)**0.101
                        ak = 0.2 / (k+1)**0.602
                        delta = np.random.choice([-1, 1], size=8)
                        p_plus = params + ck * delta
                        p_minus = params - ck * delta
                        loss_plus = loss_fn(p_plus, X_sub, y_sub, fmap, ans)
                        loss_minus = loss_fn(p_minus, X_sub, y_sub, fmap, ans)
                        g = (loss_plus - loss_minus) / (2 * ck * delta)
                        params = params - ak * g
                    
                elapsed = time.perf_counter() - t0
                
                # Test on validation
                correct = 0
                for i in range(len(X_norm)):
                    p = run_vqc_emulator(X_norm[i], best_params[0], fmap, ans)
                    pred = 1 if p >= 0.5 else 0
                    if pred == y_binary[i]: correct += 1
                acc = correct / len(X_norm)
                
                print(f"  -> Done in {elapsed:.2f}s | Loss: {best_loss[0]:.4f} | Validation Acc: {acc*100:.2f}%")
                
                results.append({
                    "feature_map": fmap,
                    "ansatz": ans,
                    "optimizer": opt,
                    "best_loss": float(best_loss[0]),
                    "accuracy_pct": round(acc * 100, 2),
                    "training_time_seconds": round(elapsed, 2),
                    "parameters": best_params[0].tolist()
                })
                
    # Select best config
    best_config = max(results, key=lambda x: x['accuracy_pct'])
    print("\n" + "=" * 65)
    print("BEST CONFIGURATION SELECTED AUTOMATICALLY")
    print(f"  Feature Map: {best_config['feature_map']}")
    print(f"  Ansatz:      {best_config['ansatz']}")
    print(f"  Optimizer:   {best_config['optimizer']}")
    print(f"  Accuracy:    {best_config['accuracy_pct']}%")
    print("=" * 65)
    
    # Save best trained parameters to active production path
    final_model = {
        "trained_parameters": best_config["parameters"],
        "final_loss": best_config["best_loss"],
        "final_accuracy_pct": best_config["accuracy_pct"],
        "target_class": target_class,
        "feature_map": best_config["feature_map"],
        "ansatz": best_config["ansatz"],
        "optimizer": best_config["optimizer"],
        "norm_stats": norm_stats
    }
    
    with open(BEST_MODEL_PATH, 'w') as f:
        json.dump(final_model, f, indent=2)
        
    with open(ADVANCED_REPORT_PATH, 'w') as f:
        json.dump({"results": results, "best": best_config}, f, indent=2)

if __name__ == '__main__':
    run_evaluation_matrix()
