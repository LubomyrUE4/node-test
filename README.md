


https://user-images.githubusercontent.com/45606434/142765229-35c06c72-9c96-4626-8260-65094dbbd3e9.mp4


# Project structure

- NodeJS backend. Express server in `/server.js`. API calls to members-api.parliament.uk/api are hmade in `api-calls.js`.
- Back-end logic to generate the emails are handled in the `/emailGenerator` folder. Emails are generated by picking sentences from `./EmailStrings.json`.
- ReactJS frontend in `/react-app`
- A Typeform questionnaire in `/react-app/src/TypeForm.jsx` which is embeded into the website UX. Typeform has an admin panel (ask Matt for login details) which is neccessary to access for project setup and any editing of the questionaire. Tyepform also acts as our database, as it stores survey responses.

When a user fills in the survey, their data first goes to Typeform, which keeps a copy of their responses. Typeform then triggers a webhook, which is linked to the back-end of the project. An email is generated for the users and sent to the front end via websockets (socket.io).

# Setup

- Run `npm i` (installs server's node modules)
- Run `npm run install-react` (installs react's node modules)
- For development, run `npm run dev`. The express server will be avalialble at localhost:5000. The React app will start at localhost:3000.

## Webhooks and Ngrok

The React features an embeded Typeform. In order for the site to work with the embedded Typeform locally, you will need to expose your localhost to Typeform via webhooks. There are a couple of ways of doing this. The following details setting up Ngrok:

Download Ngrok from `https://ngrok.com/download` and create an account. Then, navigate to the folder where Ngrok is located and run:

`./ngrok http 3000 -host-header="localhost:3000"`

Your terminal should present you with two urls in the form:

`http://[random url].ngrok.io -> http://localhost:3000`
`https://[random url].ngrok.io -> http://localhost:3000`

- Copy the https ngrok url to your clipboard.

- Login to Typeform and navigate to 'uk foreign aid' workspace, then 'connect', then webhooks.

- Add a webhook. Set the URL equal to the ngrok url from your clipboard, then add `/hook` to the end. Your webhook URL should look like:

`https://[random url].ngrok.io/hook`

-Click 'send test request'. If it is working, you should see a 200 OK status response in Typeform's webhook interface and also in the terminal in which you are running Ngrok from.

Ngrok generates a random URL each time it is started. To get a consitstent URL name, you must buy a subscription to Ngrok ~$7/month. You can then run the following command:

`./ngrok http 3000 -hostname=<yourchosenname>.ngrok.io -host-header="localhost:3000"`

This will allow you to have a consistent URL that you expose to Typeform.

# Tests

The back-end features tests made using Mocha, Chai, and Puppeteer.

- To run all the tests, run `npm run test`.
- To run tests specifically on the random email generator, run `npm run test-email`.
- To run tests specifically on members-api.parliament.uk/api, run `npm run test-postcode`.

# Build

(Optional) React skips some features and warning when running `npm run dev` that will be present in the production build. To see how the app will look in production, run `npm run react-build`. To see the built site, run `serve -s build` and navigate to the port that the terminal indicates the build script is running on.

# Heroku pipeline

We have a Heroku pipeline set up, with a staging site (https://point-7-staging.herokuapp.com/) and a production site (https://www.point7percent.org/). Whe you make a pull request, two checks will be run

- Github, checking there are no merge conflicts
- Heroku, checking the site can be built if the branch is merges. All tests in the `./tests` folder will also be run. (This check takes around 5 minutes).

Please check with Matt if you have not merged a pull reuqest before, or if either of these checks are failing. Once the branch is merged into master, an updated build will automatically be run in the staging site. Heroku will send a notification to slack when the build is done. To see site statuses, log into the Heroku dashboard (ask Matt for login details). The Heorku dashboard also has the 'promote to production' button, which moves the staging site to production.


# EC2 deployment
1. Go to www.aws.amazon.com and sign in to your console
2. Select services tab at the top, then select EC2 under Compute, and this will bring up EC2 dashboard

[![image.png](https://i.postimg.cc/cJwSkJP6/image.png)](https://postimg.cc/zLz6Vqz1)

3. Select Launch Instance
4. There you should enter the name of your instance, set Amazon Machine Image (AMI) to Ubuntu, use the default Instance type (t2.micro).
5. Now you have to create a key pair in order to be able to connect to your instance. Here you should enter the name, and in case you are using PuTTY select the .ppk private key file format. Then you should save the key file on your computer

[![image.png](https://i.postimg.cc/VkTHM2Bz/image.png)](https://postimg.cc/yDmPCQbG)

6. For Network settings you should use the default settings, except for `Allow HTTP/HTTPs traffic from the internet` checkboxes, you need to enable them

[![image.png](https://i.postimg.cc/Hk2yFp5W/image.png)](https://postimg.cc/DSS0X3BR)

7. So, you can click `Launch istance` now, then go to `Instances` tab and wait for the instance to get running
8. In order to make the instance fully public, you would have to go to `Secutiry` tab, select the attached secutiry group

[![image.png](https://i.postimg.cc/q7yhMdDS/image.png)](https://postimg.cc/rdyFQ7kN)

9. There click `Edit inbound rules` and add a new All traffic rule with '0.0.0.0/0' CIDR block

[![image.png](https://i.postimg.cc/k5JG9t86/image.png)](https://postimg.cc/mPnBykmB)

10. If you see that your EC2 instanse has running state, click `Connect` and go to `SSH client`. There you should find the steps to connect to your instance using terminal. Please make sure you are in the same folder in terminal where your key .pem file is located

[![image.png](https://i.postimg.cc/BQ96hzhn/image.png)](https://postimg.cc/fkCDy8nG)

11. Once you are connected, you can see that there are no files and all the required tools have to be installed
12. First of all, install the `npm`: 
- Run `sudo apt update` (download package information from all configured sources)
- Run `sudo apt install npm`
13. Then you would need `git` for cloning the repository to your EC2 machine:
- `sudo apt install git`
- `git clone <repository_url>`
14. Now you should go to the cloned repository by running `cd <repository_name` and start the application (see Setup above):
- `npm i`
- `npm run install-react`
15. But now it is better to avoid the 3rd command (`npm run dev`) and use the PM2 tool instead. It helps facilitate production deployments and enables you to keep running applications alive indefinitely. So, you have to install PM2 and run the application using it:
- `sudo npm install pm2 -g`
- `pm2 start npm --name "your-app-name" -- run "dev"`
16. In order to make sure your application is working you should go to either `Public IPv4 address` or `Public IPv4 DNS` address and in our case the `:3000` ending for the port (make sure you use the 'http', because the 'https' is not supported yet)

[![image.png](https://i.postimg.cc/rssqsvN5/image.png)](https://postimg.cc/gXCCBt50)

Example - `http://ec2-54-212-180-210.us-west-2.compute.amazonaws.com:3000`

17. NGINX or AWS Load Balancer are the tools required for having our application running on default 80/443 ports (without any ':3000' in URL). They would allow you to add SSL certificates and have your application running on the HTTPS. Let us set up the most recommended option - AWS Load Balancer. In the same EC2 section you were in, you should find the `Load Balancers` at the left bottom

[![image.png](https://i.postimg.cc/qRQt2ZMB/image.png)](https://postimg.cc/CBBLg7q9)

18. Then click `Create Load Balancer` and select the `Application Load Balancer`

[![image.png](https://i.postimg.cc/Z510XbPX/image.png)](https://postimg.cc/5XSxCMRm)

19. Enter the load balancer name and leave basic configuration as default

[![image.png](https://i.postimg.cc/tJwdZtbg/image.png)](https://postimg.cc/GTPT6DH0)

20. For network settings, use the default VPC and enable at least 2 availability zones (us-west-2a and us-west-2b in my case)

[![image.png](https://i.postimg.cc/RFz0gg1t/image.png)](https://postimg.cc/PL2hxzRf)

21. Use the default security group, and for Listener HTTP:80 create a new target group (to redirect all the HTTP:80 requests to our instance)

[![image.png](https://i.postimg.cc/FH35TNTP/image.png)](https://postimg.cc/hXD5jWWx)

22. You should use all the default settings, except for Port - set it to 3000
[![image.png](https://i.postimg.cc/fTk0tg8W/image.png)](https://postimg.cc/QHGMvSLv)

23. The next step is to select our instance, click `Include as pending below` and `Create target group`:

[![image.png](https://i.postimg.cc/25nHp5Wt/image.png)](https://postimg.cc/HJs0XdB0)

24. Now go back to the `Load balancer` tab and select the new target group

[![image.png](https://i.postimg.cc/R08nT1q5/image.png)](https://postimg.cc/yJmd1ZFv)

25.  If we wanted to allow HTTPS traffic, we would add an HTTPS:443 listener and configure SSL certificates for it
26.  Everything is set up and you can click `Create load balancer`. In order to find the IP address of it, go to `Network interfaces` and find the one with the ELB app/<load_balancer_name> description. You can see the IPv4 with it.

[![image.png](https://i.postimg.cc/Th89HMwx/image.png)](https://postimg.cc/y3PckGcp)

[![image.png](https://i.postimg.cc/638jqh48/image.png)](https://postimg.cc/HcC4PX2m)

27. That is it, in order to test that everything is working, we should open the load balancer address, in my case - `http://44.242.131.253` and see that it is working without any additional ports.
