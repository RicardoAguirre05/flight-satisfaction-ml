def load_data(file_path):
    import pandas as pd
    return pd.read_csv(file_path)

def preprocess_data(df):
    # Example preprocessing steps
    df = df.dropna()  # Remove missing values
    # Add more preprocessing steps as needed
    return df

def encode_categorical_features(df, categorical_cols):
    return pd.get_dummies(df, columns=categorical_cols)

def split_data(df, target_column):
    from sklearn.model_selection import train_test_split
    X = df.drop(columns=[target_column])
    y = df[target_column]
    return train_test_split(X, y, test_size=0.2, random_state=42)