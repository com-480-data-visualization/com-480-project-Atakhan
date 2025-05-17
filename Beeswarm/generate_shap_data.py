import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
import shap
import json
import os
from scipy.stats import gaussian_kde

def group_features():
    return {
        'Gold': ['goldDiff', 'goldPerMin', 'totalGold'],
        'Experience': ['experienceDiff', 'totalExperience'],
        'Objectives': ['dragons', 'heralds', 'towers'],
        'Combat': ['kills', 'deaths', 'assists', 'firstBlood'],
        'Vision': ['wardsPlaced', 'wardsDestroyed', 'visionScore']
    }

def load_and_preprocess_data(n_samples=2000):
    # Load the data
    current_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(os.path.dirname(current_dir), 'high_diamond_ranked_10min.csv')
    df = pd.read_csv(data_path)
    
    # Select features
    feature_names = [
        'blueGoldDiff', 'blueExperienceDiff', 'blueCSPerMin', 'blueDragons',
        'blueHeralds', 'blueTowersDestroyed', 'blueWardsPlaced', 'blueWardsDestroyed',
        'blueKills', 'blueDeaths', 'blueAssists', 'blueEliteMonsters',
        'blueGoldPerMin', 'blueTotalGold', 'blueTotalExperience',
        'blueAvgLevel', 'blueTotalMinionsKilled', 'blueTotalJungleMinionsKilled'
    ]
    
    # Make feature names more readable
    display_names = [
        'Gold Difference', 'Experience Difference', 'CS Per Min', 'Dragons',
        'Heralds', 'Towers Destroyed', 'Wards Placed', 'Wards Destroyed',
        'Kills', 'Deaths', 'Assists', 'Elite Monsters',
        'Gold Per Min', 'Total Gold', 'Total Experience',
        'Average Level', 'Total CS', 'Jungle CS'
    ]
    
    X = df[feature_names].values[:n_samples]
    y = (df['blueWins'].values[:n_samples] > 0.5).astype(int)
    
    return X, y, display_names

def calculate_density(values, feature_values):
    # Calculate kernel density estimation for violin plot
    kde = gaussian_kde(values)
    x_range = np.linspace(min(values), max(values), 100)
    density = kde(x_range)
    return {
        'x_range': x_range.tolist(),
        'density': density.tolist(),
        'feature_values': feature_values
    }

def train_model_and_compute_shap(X, y):
    # Train a model
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X, y)
    
    # Compute SHAP values
    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(X)
    
    if isinstance(shap_values, list):
        shap_values = shap_values[1]  # For binary classification, take class 1
    
    return shap_values, X

def process_shap_data(shap_values, X, feature_names):
    # Calculate feature importance and sort features
    feature_importance = np.abs(shap_values).mean(0)
    feature_order = np.argsort(-feature_importance)
    
    # Process data for each feature
    processed_data = []
    
    for i in range(len(feature_order)):
        idx = feature_order[i]
        feature_shap = shap_values[:, idx].flatten()
        feature_value = X[:, idx].flatten()
        
        # Calculate density for violin plot
        kde = gaussian_kde(feature_shap)
        x_range = np.linspace(np.min(feature_shap), np.max(feature_shap), 100)
        density = kde(x_range)
        
        # Normalize density
        density = density / np.max(density)
        
        # Normalize feature values to [-1, 1] range
        min_val = np.min(feature_value)
        max_val = np.max(feature_value)
        feature_value_norm = (feature_value - min_val) / (max_val - min_val) * 2 - 1
        
        feature_data = {
            "name": feature_names[int(idx)],
            "importance": float(feature_importance[idx]),
            "shap_values": feature_shap.tolist(),
            "feature_values": feature_value_norm.tolist(),
            "density": {
                "x": x_range.tolist(),
                "y": density.tolist()
            }
        }
        processed_data.append(feature_data)
    
    return processed_data

def main():
    print("Loading and preprocessing data...")
    # Create output directory if it doesn't exist
    output_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'processed_data')
    os.makedirs(output_dir, exist_ok=True)
    
    # Load and process data
    X, y, feature_names = load_and_preprocess_data()
    
    print("Training model and computing SHAP values...")
    shap_values, X = train_model_and_compute_shap(X, y)
    
    print("Processing SHAP data...")
    processed_data = process_shap_data(shap_values, X, feature_names)
    
    print("Saving results...")
    # Save processed data
    output_file = os.path.join(output_dir, 'shap_beeswarm_data.json')
    with open(output_file, 'w') as f:
        json.dump({"features": processed_data}, f)
    
    print("Done!")

if __name__ == "__main__":
    main() 