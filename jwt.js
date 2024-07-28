const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: 'your_jwt_secret', // Replace with your secret key
};

passport.use(
  new JwtStrategy(opts, (jwt_payload, done) => {
    // Find the user in the database based on the JWT payload
    User.findById(jwt_payload.id)
      .then(user => {
        if (user) {
          return done(null, user);
        }
        return done(null, false);
      })
      .catch(err => done(err, false));
  })
);

module.exports = passport;


//

const passport = require('passport');

const authorize = passport.authenticate('jwt', { session: false }, (err, user, info) => {
  if (err || !user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  req.user = user;
  next();
});

module.exports = authorize;



//


const express = require('express');
const router = express.Router();
const pool = require('./db'); // Assuming you are using a PostgreSQL pool

router.get('/users/logout', authorize, async (req, res) => {
  try {
    const userId = req.user.id;
    await pool.query('UPDATE users SET token=NULL WHERE id=$1', [userId]);
    res.json({ message: 'User logged out successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;



//



const express = require('express');
const multer = require('multer');
const authorize = require('./authorize');
const router = express.Router();

const upload = multer({ dest: 'uploads/' });

router.post('/upload', authorize, upload.single('planetImage'), (req, res) => {

  res.json({ message: 'File uploaded successfully', file: req.file });
});

module.exports = router;

//


const express = require('express');
const passport = require('./passport');
const logoutRoute = require('./logout');
const uploadRoute = require('./upload');

const app = express();

app.use(passport.initialize());

app.use('/', logoutRoute);
app.use('/', uploadRoute);

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});