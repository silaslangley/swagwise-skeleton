module.exports = function(app) {

    // Require mongoose dependency
    var mongoose = require('mongoose');

    /* Add the dependency to passport after the mongoose require decleration */
    var passport = require('passport');

    /* Add the dependency to Stripe */
    var stripe   = require('stripe')('sk_test_MPZw5Of5EjrfHaAM789HgPUc');

    // Create a new instance of the Express 4 router

    var router = require('express').Router();

    var User = mongoose.model('User');

    var Product = mongoose.model('Product');

    /* ======================= MIDDLEWARE ====================== */

    /**app.use('/api/admin', passport.authenticate('local'), function(req, res) {

        console.log('the request %j', req);
        
        if (req.user.isAdmin) {
            next();
        } else {
            res.send({
                status: 400,
                message: 'Access Denied' 
            });
        }

    }); **/

    function checkRole(role) {
        return function(req, res, next) {
             //if (req.user.isAdmin == true
            if (req.user && req.user[role]) {
                next();
            } else {
                res.send(401, "Unauthorized");
            }
        }
    }

    /* ======================= REST ROUTES ====================== */
    // Handle API calls

    router.route('/*')
        .all(checkRole('isAdmin'));

    // Products API route
    router.route('/products')
        .get(function(req, res) {
            var filter = {
                isActive: true
            };

            if (req.query.isFeatured) {
                filter.isFeatured = typeof req.query.isFeatured == 'boolean' ? req.query.isFeatured : true;
            }

            // use mongoose to get all products in the database
            Product.find(filter, function(err, products) { //anything on the query string, express will turn into a query string object as two lines below

                //http://localhost:9001/api/swag/?isFeatured=true&foo=bar&ninja=false
                // req.query = {isFeatured: true, foo: bar, ninja: false}

                // if there is an error retrieving, send the error. nothing after res.send(err) will execute
                if (err)
                    res.send(err);

                res.send(products); // return products in JSON format
            });
        })
        .post(function(req, res) {

            Product.create(req.body, function(err, product) {

                if(err) res.send(err);

                res.send(product);
            });

        });

    router.route('/products/:id')
        .get(function(req, res) {
            // use mongoose to get a product in the database by id
            Product.findOne({id: req.params.id}, function(err, product) {
                // if there is an error retrieving, send the error. nothing after res.send(err) will execute
                if (err)
                    res.send(err);

                res.send(product); // return the product in JSON format
            });
        })

        .post(function(req, res) {

            Product.findByIdAndUpdate(req.params.id, req.body, function(err, product) {
                if(err) res.send(err);

                res.send(product);
            });
        })
               
        .delete(function(req, res) {

            Product.findByIdAndRemove(req.params.id, function(err, response) {
                if(err) res.send(err);

                res.send(response);
            });

        });


    router.route('/users')
        .get(function(req, res) {
        

            User.find(req.query, function(err, users) {
                
                if (err) res.send(err);

                res.send(users);
            });
        })
        .post(function(req, res) {

            /* var user = new User(req.body);

            user.save(function(err, user) {

                if(err) res.send(err);

                res.send(user);
            }); */


            User.create(req.body, function(err, user) {

                if(err) res.send(err);

                res.send(user);
            });

        });

    router.route('/users/:id')
        .get(function(req, res) {

            User.findOne({_id: req.params.id}, function(err, user) {
                if (err) {res.send(err)};

                res.send(user);
            });
        })
        .post(function(req, res) {
           /* User.findOne({_id: req.params.id}, function(err, user) {

                if (err) res.send(err);

               
                if (req.body.firstName) {
                    user.firstName = req.body.firstName;
                };

                if (req.body.lastName) {
                    user.lastName = req.body.lastName;
                };

                if (req.body.email) {
                    user.email = req.body.email;
                };

                if (typeof req.body.isActive === 'boolean') {
                    user.isActive = req.body.isActive;
                };

                if (typeof req.body.isAdmin === 'boolean') {
                    user.isAdmin = req.body.isAdmin;
                };

                user.save(function(err, user) {
                    if(err) res.send(err);

                    res.send(user);

                }) */

            User.findByIdAndUpdate(req.params.id, req.body, function(err, user) {
                if(err) res.send(err);

                res.send(user);
            });
        })
              
        .delete(function(req, res) {

            /* User.findOne({id: req.params.id}, function(err, user) {
                        if(err) res.send(err);

                        user.remove(function(err, response ) {
                            if (err) res.send(err);

                            res.send(response);
                        });
                    }); */

            User.findByIdAndRemove(req.params.id, function(err, response) {
                if(err) res.send(err);

                res.send(response);
            });

        });

    app.use('/api/admin', router);
  
};