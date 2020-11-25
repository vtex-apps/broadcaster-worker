# Broadcaster Worker

App in VTEXIO designed to listen to broadcaster catalog changes 
and to notify other apps that want to know the changes.

### How it works?

The broadcaster worker listens to the SKU change event in the events system. It receives the `id` of the SKU that has been indexed, then gets all SKU data and checks if there was any change in the data, it does that by hashing the catalog response and comparing it to the one saved in the database, if the SKU has changed it pushes a new event with the SKU data.

It does the same thing for the SKU's product, brand and categories data.