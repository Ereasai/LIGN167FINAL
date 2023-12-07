const TREE_DATA = {
    "vector": {
        "summary": "",
        "resources": [],
        "prereqs": [],
        "learned": false
    },
    "dot_prod": {
        "summary": "",
        "resources": [],
        "prereqs": [
            "vector"
        ],
        "learned": false
    },
    "mat_mul": {
        "summary": "",
        "resources": [],
        "prereqs": [
            "dot_prod"
        ],
        "learned": false
    },
    "lin_reg": {
        "summary": "",
        "resources": [],
        "prereqs": [
            "mat_mul"
        ],
        "learned": false
    },
    "log_reg": {
        "summary": "",
        "resources": [],
        "prereqs": [
            "lin_reg",
            "mle"
        ],
        "learned": false
    },
    "mle": {
        "summary": "",
        "resources": [],
        "prereqs": [
            "rand_var",
            "gaussian",
            "optimization"
        ],
        "learned": false
    },
    "rand_var": {
        "summary": "",
        "resources": [],
        "prereqs": [],
        "learned": false
    },
    "gaussian": {
        "summary": "",
        "resources": [],
        "prereqs": [
            "expectation",
            "variance"
        ],
        "learned": false
    },
    "expectation": {
        "summary": "",
        "resources": [],
        "prereqs": [],
        "learned": false
    },
    "variance": {
        "summary": "",
        "resources": [],
        "prereqs": [],
        "learned": false
    },
    "optimization": {
        "summary": "",
        "resources": [],
        "prereqs": [
            "partial_deriv"
        ],
        "learned": false
    },
    "partial_deriv": {
        "summary": "",
        "resources": [],
        "prereqs": [
            "derivative"
        ],
        "learned": false
    },
    "derivative": {
        "summary": "",
        "resources": [],
        "prereqs": [],
        "learned": false
    }
}

export default TREE_DATA;