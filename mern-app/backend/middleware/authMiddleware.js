const jwt = require('jsonwebtoken')
const User = require('../models/User')

module.exports = async (req, res, next) => {
  try {
    const auth = req.headers.authorization || ''
    const token = auth.startsWith('Bearer ') ? auth.split(' ')[1] : null
    if (!token) return res.status(401).json({ message: 'No token provided' })

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    if (!decoded || !decoded.id) return res.status(401).json({ message: 'Invalid token' })

    // attach user info (lightweight) — avoid sending password downstream
    const user = await User.findById(decoded.id).select('-password')
    if (!user) return res.status(401).json({ message: 'User not found' })

    req.user = user
    next()
  } catch (err) {
    console.error('authMiddleware error', err)
    return res.status(401).json({ message: 'Unauthorized' })
  }
}
