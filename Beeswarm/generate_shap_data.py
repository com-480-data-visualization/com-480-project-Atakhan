import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
import shap
import json
import os
from scipy.stats import gaussian_kde
import matplotlib.pyplot as plt

def group_features():
    return {
        'Gold': ['goldDiff', 'goldPerMin', 'totalGold'],
        'Experience': ['experienceDiff', 'totalExperience'],
        'Objectives': ['dragons', 'heralds', 'towers'],
        'Combat': ['kills', 'deaths', 'assists', 'firstBlood'],
        'Vision': ['wardsPlaced', 'wardsDestroyed', 'visionScore']
    }

def load_and_preprocess_data(n_samples=2000):
    current_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(os.path.dirname(current_dir), 'high_diamond_ranked_10min.csv')
    df = pd.read_csv(data_path)

    feature_names = [
        'blueGoldDiff', 'blueExperienceDiff', 'blueCSPerMin', 'blueDragons',
        'blueHeralds', 'blueTowersDestroyed', 'blueWardsPlaced', 'blueWardsDestroyed',
        'blueKills', 'blueDeaths', 'blueAssists', 'blueEliteMonsters',
        'blueGoldPerMin', 'blueTotalGold', 'blueTotalExperience',
        'blueAvgLevel', 'blueTotalMinionsKilled', 'blueTotalJungleMinionsKilled'
    ]

    display_names = [
        'Gold Difference', 'Experience Difference', 'CS Per Min', 'Dragons',
        'Heralds', 'Towers Destroyed', 'Wards Placed', 'Wards Destroyed',
        'Kills', 'Deaths', 'Assists', 'Elite Monsters',
        'Gold Per Min', 'Total Gold', 'Total Experience',
        'Average Level', 'Total CS', 'Jungle CS'
    ]

    X = df[feature_names].values[:n_samples]
    y = (df['blueWins'].values[:n_samples] > 0.5).astype(int)

    return X, y, feature_names, display_names

def train_model_and_compute_shap(X, y):
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X, y)

    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(X)

    # Select SHAP values for class 1
    if isinstance(shap_values, list):
        shap_values = shap_values[1]
    elif shap_values.ndim == 3:
        shap_values = shap_values[:, :, 1]

    print("SHAP shape:", shap_values.shape)
    print("X shape:", X.shape)

    return shap_values, X, model

def process_shap_data(shap_values, X, feature_names):
    shap_values = np.array(shap_values)
    X = np.array(X)

    feature_importance = np.abs(shap_values).mean(axis=0).ravel()
    feature_order = np.argsort(-feature_importance)

    print("Number of features from SHAP:", shap_values.shape[1])
    print("Number of features from X:", X.shape[1])
    print("Number of feature names:", len(feature_names))

    processed_data = []

    for idx in feature_order:
        if idx >= X.shape[1] or idx >= len(feature_names):
            print(f"Skipping invalid index: {idx}")
            continue

        feature_shap = shap_values[:, idx]
        feature_value = X[:, idx]

        kde = gaussian_kde(feature_shap.reshape(-1, 1).T)
        x_range = np.linspace(feature_shap.min(), feature_shap.max(), 200)
        density = kde(x_range.reshape(-1, 1).T)
        density = density.flatten() / (density.max() * 1.5)

        min_val = feature_value.min()
        max_val = feature_value.max()
        feature_value_norm = (feature_value - min_val) / (max_val - min_val) * 2 - 1

        feature_data = {
            "name": feature_names[idx],
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

def plot_shap_beeswarm(shap_values, X, display_names, output_dir):
    print("Generating SHAP beeswarm plot...")
    shap.summary_plot(shap_values, X, feature_names=display_names, show=False)
    plot_path = os.path.join(output_dir, "shap_beeswarm_plot.png")
    plt.tight_layout()
    plt.savefig(plot_path, dpi=300)
    plt.close()
    print(f"Beeswarm plot saved to: {plot_path}")

def main():
    print("Loading and preprocessing data...")
    output_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'processed_data')
    os.makedirs(output_dir, exist_ok=True)

    X, y, feature_names, display_names = load_and_preprocess_data()

    print("Training model and computing SHAP values...")
    shap_values, X, model = train_model_and_compute_shap(X, y)

    print("Processing SHAP data...")
    processed_data = process_shap_data(shap_values, X, display_names)

    print("Saving results...")
    output_file = os.path.join(output_dir, 'shap_beeswarm_data.json')
    with open(output_file, 'w') as f:
        json.dump({"features": processed_data}, f)

    plot_shap_beeswarm(shap_values, X, display_names, output_dir)

    print("Done!")

if __name__ == "__main__":
    main()
