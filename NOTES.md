[Transactional emails]('https://stackoverflow.com/questions/28865034/sendgrid-nodejs-or-nodemailer')

- I made soft delete on the account deletion feature! (Do cron jobs here! don't forget!).

- [Mongoose TTL](https://stackoverflow.com/questions/14597241/setting-expiry-time-for-a-collection-in-mongodb-using-mongoose)

- [take a look](https://www.freecodecamp.org/news/how-to-test-in-express-and-mongoose-apps/)

- Create separate mailing server!
- Create separate caching server with redis!

//
I'd think the things you should be interested in for a "production ready" application would include:

- automated testing for PRs

- automated deployment

- potentially, examples of rolling, canary, and blue/green deployment strategies

- automated rollback

- backups

- availability monitoring and alerting

- performance monitoring

- observability

- dependency management

- vulnerability auditing for dependencies

### Tests:

- `Unit testing`: Test individual function/ unit!
- `Integration testing`: Test two or more interacting functions/ units/ components
- `End to End testing (e2e)`: Test the whole scenario no matters how many units/ functions they are!
