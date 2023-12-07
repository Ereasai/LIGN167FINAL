const TREE_DATA = {
    'vector': {
        'summary':"A vector is is a fundamental mathematical structure that is characterized by both a direction (ordering) and a magnitude. For instance, wind has both a direction (North, South-West, etc) and a magnitude (10 km/hour) and could be represented as a vector (10 km/hour South-West). A point in Euclidean space is often represented as a vector of its coordinates and is the most common type of vector encountered. More generally, a vector is an element of a vector space -- a set that is closed under scalar multiplication and vector addition. [additional note: a vector is a very general entity that takes on many forms depending on its context, for instance, in certain vector spaces a vector could be a function such as f(x) = sin(x)]",
        'goals':['Be able to compute various operations on vectors: addition, scalar multiplication, and linear combination',
                'Be familiar with the geometric representation of vectors as points and arrows'],
        'prereqs':[],
        'learned':False
    },
    'dot_prod': {
        'summary':"A vector is is a fundamental mathematical structure that is characterized by both a direction (ordering) and a magnitude. For instance, wind has both a direction (North, South-West, etc) and a magnitude (10 km/hour) and could be represented as a vector (10 km/hour South-West). A point in Euclidean space is often represented as a vector of its coordinates and is the most common type of vector encountered. More generally, a vector is an element of a vector space -- a set that is closed under scalar multiplication and vector addition. [additional note: a vector is a very general entity that takes on many forms depending on its context, for instance, in certain vector spaces a vector could be a function such as f(x) = sin(x)]",
        'goals':['Define the dot product',
                'Define the length of a vector in terms of the dot product',
                'Know what unit vectors are and why they are useful',
                'Be able to rescale a vector to unit length',
                'Define orthogonality in terms of the dot product',
                'Know the cosine formula for the dot product'],
        'prereqs':['vector'],
        'learned':False
    },
    'mat_mul':{
        'summary':"Matrix multiplication is an operator on matrices which satisfies many of the properties of multiplication, although not commutativity.",
        'goals':['Be familiar with three equivalent interpretations of matrix multiplication: dot products, outer products, and matrix-vector multiplication',
                'Know what constraint the sizes of the matrices must satisfy for the product to be defined',
                'Show that matrix multiplication is associative and distributive but not commutative',
                'Know what the identity matrix refers to'],
        'prereqs':['dot_prod'],
        'learned':False
    },
    'lin_reg':{
        'summary':"Linear regression is an algorithm for learning to predict a real-valued ``target'' variable as a linear function of one or more real-valued ``input'' variables. It is one of the most widely used statistical learning algorithms, and with care it can be made to work very well in practice. Because it has a closed-form solution, we can exactly analyze many properties of linear regression which have no exact form for other models. This makes it a useful starting point for understanding many other statistical learning algorithms.",
        'goals':['Know the cost function for linear regression',
                 'Know of both methods for fitting the model (gradient descent and closed form solution)'],
        'prereqs':['mat_mul'],
        'learned':False
    },
    'log_reg':{
        'summary':"Logistic regression is a machine learning model for binary classification, i.e. learning to classify data points into one of two categories. It's a linear model, in that the decision depends only on the dot product of a weight vector with a feature vector. This means the classification boundary can be represented as a hyperplane. It's a widely used model in its own right, and the general structure of linear-followed-by-sigmoid is a common motif in neural networks.",
        'goals':["Know what assumption logistic regression makes about p(y|x)",
            "Know of one method for fitting the maximum likelihood solution (e.g. gradient descent)",
            "Understand why logistic regression uses a linear decision boundary to classify data",
            "Understand why it's common to use a regularization term (such as the squared norm of the weights)"],
        'prereqs':['lin_reg','mle'],
        'learned':False
    },
    'mle':{
        'summary':"Maximum likelihood is a general and powerful technique for learning statistical models, i.e. fitting the parameters to data. The maximum likelihood parameters are the ones under which the observed data has the highest probability. It is widely used in practice, and techniques such as Bayesian parameter estimation are closely related to maximum likelihood.",
        'goals':[],
        'prereqs':['rand_var','gaussian','optimization'],
        'learned':False
    },
    'rand_var':{
        'summary':"Random variables are the central object of probability theory. As their name implies, can be thought of as variables whose values are randomly determined. Mathematically, they are represented as functions on a sample space.",
        'goals':["Know the definition of a random variable (as a function on the sample space)",
                "Know the definition of the distribution of a random variable",
                "Know the distinction between discrete and continuous random variables",
                "Know how distributions can be represented in terms of probability mass functions and probability density functions"],
        'prereqs':[],
        'learned':False
    },
    'gaussian':{
        'summary':"The Gaussian (or normal) distribution has a bell shape, and is one of the most common in all of statistics. The Central Limit Theorem shows that sums of large numbers of independent, identically distributed random variables are well approximated by a Gaussian distribution. The parameter estimates in a statistical model are also asymptotically Gaussian. Gaussians are widely used in probabilistic modeling for these reasons, together with the fact that Gaussian distributions can be efficiently manipulated using the techniques of linear algebra.",
        "goals":[
                "Know the PDF of the Gaussian distribution and be aware that it is bell-shaped",
                "Show that linear functions of Gaussian random variables are also Gaussian",
                "Show that the parameters mu and sigma represent the mean and standard deviation"
              ],
        'prereqs':['expectation','variance'],
        'learned':False
    },
    'expectation':{
        'summary':"The expectation of a random variable is the value that it takes 'on average'.",
        'goals':["Know the definitions of expectation for both discrete and continuous random variables",
                "Be able to compute expectations",
                "Be able to compute the expectation of a function of a random variable"],
        'prereqs':[],
        'learned':False
    },
    'variance':{
        'summary':"The variance is a measure of how much the random variable deviates from that value 'on average.'",
        'goals':["Know the definitions of variance for both discrete and continuous random variables",
                "Be able to compute variances"],
        'prereqs':[],
        'learned':False
    },
    'optimization':{
        'summary':"In an optimization problem, one is interested in minimizing or maximizing a function, possibly subject to equality or inequality constraints. The extrema must occur on the boundary of the set, at points which are not differentiable, or at points where the partial derivatives are zero.",
        'goals':["Know what is meant by local and global extrema",
            "Know that the extreme must satisfy at least one of the following conditions: on the boundary, not differentiable, or all partial derivatives are zero",
            "Give an example where a critical point is a saddle point rather than an extremum"],
        'prereqs':['partial_deriv'],
        'learned':False
    },
    'partial_deriv':{
        'summary':"A partial derivative of a function of several variables is its derivative with respect to one of those variables, with the others held constant (as opposed to the total derivative, in which all variables are allowed to vary). Intuitively, a partial derivative measures the instantaneous rate of change for a single variate in a multivariate function.",
        'goals':['Know the definition of partial derivatives',
                'Be able to compute partial derivatives'],
        'prereqs':[],
        'learned':False
    },
}

export default TREE_DATA;