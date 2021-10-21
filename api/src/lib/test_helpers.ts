export const mockUserID = (id) => {
  mockCurrentUser({
    id,
    email: 'test@test.test',
    createdAt: new Date(),
    salt: '',
    hashedPassword: '',
  })
}
