import label_file_proc 
import os
#import joblib

from sklearn.cluster import MiniBatchKMeans
from tensorflow.keras.layers import Input, Dense, LeakyReLU
from tensorflow.keras.models import Model

def build_autoencoder(input_dim, encoding_dim, hidden_layers):
    """
    hidden_layers: list of ints, e.g. [128, 64]
    """
    inp = Input(shape=(input_dim,))
    x = inp

    for units in hidden_layers:
        x = Dense(units)(x)
        #x = BatchNormalization()(x)
        x = LeakyReLU(0.1)(x)

    bottleneck = Dense(encoding_dim, name="bottleneck")(x)

    for units in reversed(hidden_layers):
        x = Dense(units)(bottleneck)
        #x = BatchNormalization()(x)
        x = LeakyReLU(0.1)(x)
        bottleneck = x

    out = Dense(input_dim)(x)

    model = Model(inp, out)
    model.compile(optimizer="adam", loss="mse")
    return model

def run_clustering(features, y, num_clusters):

    kmeans = MiniBatchKMeans(
    n_clusters=num_clusters,
    batch_size=1024,
    n_init=3,
    random_state=42
    )
    labels = kmeans.fit_predict(features)

    sil = silhouette_score(features, labels)
    metrics = evaluate_cluster(labels, y)

    return {
        "silhouette": sil,
        **metrics
    }

def fit_predict_ae(X, hidden_layers, enc_dim, verbose = 0):
    ae = build_autoencoder(
        input_dim=X.shape[1],
        encoding_dim=enc_dim,
        hidden_layers=hidden_layers
    )

    encoder = Model(ae.input, ae.get_layer("bottleneck").output)

    ae.fit(
        X, X,
        epochs=500,
        batch_size=128,
        shuffle=True,
        verbose=verbose,
        callbacks=callbacks
    )

    X_ae = encoder.predict(X, batch_size=256, verbose=0)
    return ae, X_ae


