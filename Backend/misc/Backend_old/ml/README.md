# ML Model for Crop Recommendation

## Overview

This ML model predicts the best crop to grow based on soil nutrients and environmental conditions.

## Model Details

- **Algorithm**: Random Forest Classifier
- **Accuracy**: 99.55%
- **Dataset**: 2,200 samples
- **Features**: N, P, K, temperature, humidity, pH, rainfall
- **Output**: Crop recommendation with confidence score

## Files

- `train_model.py` - Training script
- `predict.py` - Prediction script
- `crop_recommendation_model.pkl` - Trained model (generated)
- `model_info.json` - Model metadata (generated)
- `requirements.txt` - Python dependencies

## Training the Model

```bash
cd Backend/ml
pip install -r requirements.txt
python train_model.py
```

## Using the Model

The model is automatically used by the backend API:

```bash
POST /api/ml/recommend
{
  "N": 90,
  "P": 42,
  "K": 43,
  "temperature": 20.87,
  "humidity": 82.00,
  "ph": 6.50,
  "rainfall": 202.93
}
```

## Supported Crops

22 crop types: apple, banana, blackgram, chickpea, coconut, coffee, cotton, grapes, jute, kidneybeans, lentil, maize, mango, mothbeans, mungbean, muskmelon, orange, papaya, pigeonpeas, pomegranate, rice, watermelon
