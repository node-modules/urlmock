module.exports = {
  name: 'common-user-name',
  age: 18,
  isAdmin: false,
  logined: false,
  links: {
    github: {
      name: 'github-name',
      url: 'https://github.com/github-name'
    },
    twitter: {
      name: 'twitter-name',
      url: 'https://twitter.com/name'
    }
  },
  __requires: ['./session']
};
