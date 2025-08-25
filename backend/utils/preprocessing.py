import numpy as np
from scipy import sparse

def _clip_after_preproc(Xt, cap: float = 8.0):
    if sparse.issparse(Xt):
        Xt = Xt.tocoo()
        Xt.data = np.clip(Xt.data, -cap, cap)
        return Xt.tocsr()
    return np.clip(Xt, -cap, cap)