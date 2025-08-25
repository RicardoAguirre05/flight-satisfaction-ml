# Flight Satisfaction Machine Learning Project

This project aims to analyze and predict flight satisfaction using machine learning techniques. It is structured to separate the backend and frontend components, allowing for a clean and organized codebase.

## Project Structure

```
flight-satisfaction-ml/
├── backend/
│   ├── app.py
│   ├── model.pkl
│   └── utils/
│       └── preprocessing.py
├── frontend/
│   ├── public/
│   ├── src/
│   └── package.json
├── data/
│   └── airline.csv
├── notebooks/
│   └── EDA.ipynb
├── requirements.txt
└── README.md
```

## Backend

The backend is built using Flask and serves as the API for the machine learning model. It includes:

- **app.py**: The main entry point for the Flask application.
- **model.pkl**: The trained machine learning model.
- **utils/preprocessing.py**: Utility functions for data preprocessing.

## Frontend

The frontend is a React application that provides a user interface for interacting with the backend. It includes:

- **public/**: Static files for the React app.
- **src/**: Source code for the React app.
- **package.json**: Manages dependencies and scripts for the React application.

## Data

The data directory contains the datasets used for training and testing the model:

- **airline.csv**: Dataset related to flight satisfaction.

## Notebooks

The notebooks directory contains Jupyter notebooks for data exploration:

- **EDA.ipynb**: Used for exploratory data analysis.

## Installation

To set up the project, follow these steps:

1. **Backend**:
   - Create a `requirements.txt` file and add the necessary libraries (Flask, scikit-learn, pandas, etc.).
   - Run `pip install -r requirements.txt` to install the dependencies.

2. **Frontend**:
   - Navigate to the `frontend` directory and run `npx create-react-app .` to set up the React app.

## Usage

After setting up the project, you can run the backend and frontend servers to start using the application. 

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any suggestions or improvements. 

## License

This project is licensed under the MIT License.