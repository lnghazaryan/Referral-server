# User do payment and click on become ref button
# we create new referal user for him in our DB (must be unique,  and only once) 
# we can store only email, phone, eventId, createdDate
# we need to generate referal id for him as we have already

# he share url with others
# when Y person open URL he can write his email and he will get Promo on that Email, he becomes Refered
# when Y do payment we need to update his info if he is exist and no phone and isPayed false, after that we need to generate promo and sent to X (X - is referal, Y - refered)
# if Y already exist and has payment then we dont send smthing
# if after payment Y dont exist we need to create new Refered with all data
# for refered we can store email, phone, eventId, createdDate, eventId, isPayed, referal_id
# we need to check on Y createing if he is not samme X as we have, we need to check mail and referal code for him

# on promo generation we have allready events ids in events table

# now we dont need transaction, partners tables, just remove them

# in our CRM admin panel, disable adding for promos, referals, referds. we can add only users, and edit events

# in events table on change store whole event data that we have from eventhub api
