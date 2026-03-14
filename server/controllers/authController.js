import bcrypt from 'bcryptjs'
import { query } from '../utils/db.js'
import { generateToken } from '../middleWare/authMiddleware.js'

export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body
    
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: '用户名和密码不能为空'
      })
    }
    
    const admins = await query('SELECT * FROM admins WHERE username = ?', [username])
    
    if (admins.length === 0) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      })
    }
    
    const admin = admins[0]
    const isMatch = await bcrypt.compare(password, admin.password)
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      })
    }
    
    const token = generateToken({ id: admin.id, username: admin.username })
    
    res.json({
      success: true,
      message: '登录成功',
      token,
      user: {
        id: admin.id,
        username: admin.username,
        nickname: admin.nickname,
        avatar: admin.avatar
      }
    })
  } catch (error) {
    next(error)
  }
}