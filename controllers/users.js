const User = require("../models/user");

// Render signup form
module.exports.renderSignup = (req, res) => {
    res.render("users/signup");
};

// Handle signup logic
module.exports.signup = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        const user = new User({ username, email });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, (err) => {
            if (err) return next(err);
            req.flash("success", "Welcome to WanderLust!");
            res.redirect("/listings");
        });
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
};

// Render login form
module.exports.renderLogin = (req, res) => {
    res.render("users/login");
};

// Handle login logic
module.exports.login = (req, res) => {
    req.flash("success", "Welcome back to WanderLust!");
    const redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
};

// Handle logout
module.exports.logout = (req, res, next) => {
    req.logout(function(err) {
        if (err) return next(err);
        req.flash("success", "You have logged out!");
        res.redirect("/listings");
    });
};