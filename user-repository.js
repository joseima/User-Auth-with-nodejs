import DBLocal from 'db-local'
import bcrypt from 'bcrypt'
const { Schema } = new DBLocal({ path: './db' })

const User = Schema('User', {
  _id: { type: String, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true }
})

export class UserRepository {
  static async create ({ username, password }) {
    Validation.username(username)
    Validation.password(password)
    const user = User.findOne({ username })
    if (user) throw new Error('this user already exit')

    const id = crypto.randomUUID()
    const hashedPassword = await bcrypt.hash(password, 10)
    User.create({
      _id: id,
      username,
      password: hashedPassword
    }).save()

    return id
  }

  static async login ({ username, password }) {
    Validation.username(username)
    Validation.password(password)
    const user = User.findOne({ username })
    if (!user) throw new Error('this user does not exit')

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) throw new Error('The password is invalid')

    const { password: _, ...publicUser } = user
    return publicUser
  }
}

class Validation {
  static username (username) {
    if (typeof username !== 'string') throw new Error('Username must be a string')
    if (username.length < 3) throw new Error('Username must haveat least 3 characters long')
  }

  static password (password) {
    if (typeof password !== 'string') throw new Error('Passord must be a string')
    if (password.length < 6) throw new Error('Password must haveat least 3 characters long')
  }
}
