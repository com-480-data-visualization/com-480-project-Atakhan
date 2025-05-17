import numpy as np
import pandas as pd
import json
from sklearn.preprocessing import StandardScaler
import shap
import warnings
warnings.filterwarnings('ignore')

def process_shap_data(shap_values, feature_values, feature_names, n_samples=1000):
    """
    Process SHAP values to create a more efficient beeswarm visualization.
    
    Args:
        shap_values: numpy array of SHAP values
        feature_values: original feature values
        feature_names: list of feature names
        n_samples: number of samples to keep (reduces data size)
    """
    
    # Convert to numpy arrays if needed
    shap_values = np.array(shap_values)
    feature_values = np.array(feature_values)
    
    # Standardize feature values for better visualization
    scaler = StandardScaler()
    feature_values_scaled = scaler.fit_transform(feature_values)
    
    # Initialize lists to store processed data
    processed_shap = []
    processed_features = []
    
    for i in range(shap_values.shape[1]):
        # Get values for current feature
        curr_shap = shap_values[:, i]
        curr_feat = feature_values_scaled[:, i]
        
        # Sort by SHAP value to ensure even distribution
        sort_idx = np.argsort(curr_shap)
        curr_shap = curr_shap[sort_idx]
        curr_feat = curr_feat[sort_idx]
        
        # Reduce number of points while maintaining distribution
        if len(curr_shap) > n_samples:
            idx = np.linspace(0, len(curr_shap) - 1, n_samples, dtype=int)
            curr_shap = curr_shap[idx]
            curr_feat = curr_feat[idx]
        
        processed_shap.append(curr_shap.tolist())
        processed_features.append(curr_feat.tolist())
    
    # Transpose the data back to original format
    processed_shap = list(map(list, zip(*processed_shap)))
    processed_features = list(map(list, zip(*processed_features)))
    
    # Create output dictionary
    output_data = {
        "shap_values": processed_shap,
        "features": processed_features,
        "feature_names": feature_names
    }
    
    return output_data

def save_processed_data(output_data, output_file='./processed_data/shap_beeswarm_data.json'):
    """Save the processed data to a JSON file"""
    with open(output_file, 'w') as f:
        json.dump(output_data, f)

# Example usage (uncomment and modify as needed):
"""
# Load your model and data
model = ...
X = ...

# Calculate SHAP values
explainer = shap.TreeExplainer(model)
shap_values = explainer.shap_values(X)
if isinstance(shap_values, list):
    shap_values = shap_values[0]  # For multi-class models, take first class

# Process and save the data
feature_names = X.columns.tolist()
output_data = process_shap_data(
    shap_values=shap_values,
    feature_values=X.values,
    feature_names=feature_names,
    n_samples=1000  # Adjust this value based on your needs
)
save_processed_data(output_data)
""" 