# !!!NO LONGER USING THIS!!! Latest code: go to https://github.com/gaurisinghal/RouterBackend
# ESC Backend
## 6/3/2020
- User(customer) sends message to admin account
- Database module would push relevant data into MySQL -> Stimulated by printing messages in the console
- Admin match customer to agent -> Simulated by matching user's input to a hardcoded specific string
- Admin creates a Bubble
- Admin adds user and agent into Bubble -> simulated by hardcoding agent's id

## 24/3/2020
- A simple webpage for a form asking for first name and last name
- Server end gets these information and creates a new guest user account
- Newly created guest user account's credentials (loginEmail and password) would be passed back

## 25/3/2020
- Integrating with database
- Newly created guest account will be added to a bubble and its jid pushed back to database
- Updating Engage field of agent by chatting with admin account (ONLINE or OFFLINE)
