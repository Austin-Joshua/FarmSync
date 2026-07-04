import unittest
import numpy as np
import sys
from pathlib import Path

# Add current directory to path so we can import modules
sys.path.append(str(Path(__file__).resolve().parent))

from quantum_engine import QuantumDecisionEngine
import predict_logic as predictor

class TestFarmSyncQuantumEngine(unittest.TestCase):
    def setUp(self):
        self.engine = QuantumDecisionEngine()

    def test_angle_encoding_bounds(self):
        """Verify that classical features are correctly mapped to [0, pi] rotation space."""
        test_features = np.array([-10.0, 0.0, 50.0, 1000.0])
        angles = self.engine.angle_encode(test_features, num_qubits=4)
        
        self.assertEqual(len(angles), 4)
        for angle in angles:
            self.assertTrue(0.0 <= angle <= np.pi, f"Angle {angle} is out of bounds [0, pi]")

    def test_vqc_inference_output(self):
        """Verify that VQC outputs a valid 16-state probability vector summing to 1.0."""
        test_features = [85.0, 35.0, 40.0, 6.8] # N, P, K, pH
        probs = self.engine.run_vqc_inference(test_features)
        
        self.assertEqual(len(probs), 16)
        self.assertAlmostEqual(sum(probs), 1.0, places=5)
        for p in probs:
            self.assertTrue(0.0 <= p <= 1.0)

    def test_qaoa_optimization_matrix(self):
        """Verify the QUBO solver successfully identifies optimal binary inputs and scales yield."""
        test_yield = 25.0
        test_input = {"fertilizer": 4.5, "water": 45000.0, "pesticide": 2.2}
        opt_res = self.engine.optimize_resources_qaoa(test_yield, test_input)
        
        required_keys = [
            "optimal_state_qubits", "optimal_fertilizer_strategy",
            "optimal_water_strategy", "optimal_pesticide_strategy",
            "classical_yield_tons", "quantum_optimized_yield_tons",
            "estimated_resource_savings_rupees", "qubo_minimum_energy"
        ]
        for key in required_keys:
            self.assertIn(key, opt_res)
            
        self.assertEqual(opt_res["classical_yield_tons"], test_yield)
        self.assertTrue(opt_res["quantum_optimized_yield_tons"] >= 0)
        self.assertEqual(len(opt_res["optimal_state_qubits"]), 3)

    def test_end_to_end_hybrid_flow(self):
        """Verify end-to-end integration mapping in predictor logic."""
        test_crop_input = {
            'N': 90.0, 'P': 42.0, 'K': 43.0, 
            'temperature': 20.9, 'humidity': 82.0, 
            'ph': 6.5, 'rainfall': 202.9
        }
        res = predictor.predict(test_crop_input)
        self.assertTrue(res["success"])
        self.assertIn("quantum_active", res)
        self.assertIn("quantum_vqc_probabilities", res)
        self.assertIn("classical_confidence_percent", res)

if __name__ == "__main__":
    unittest.main()
