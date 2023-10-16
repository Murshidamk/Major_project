# Food Ordering Application 

This repository contains JAVA backend code for Food Ordering Application

Create a database in Postgres named `restaurantdb`

In the API module, update the database details in `\src\main\resources\application.yaml`
- url: jdbc:postgresql://localhost:<port>/restaurantdb
- username: \<username\>
- password: \<password\>

In the DB module, update the database details in `\src\main\resources\config\localhost.properties`

- server.port=\<port\>
- server.host=localhost
- database.name=restaurantdb
- database.username=\<username\>
- database.password=\<password\>

Run command 
> mvn clean install -DskipTests -Psetup
 
If this fails due to test compilation errors run
> mvn clean install '-Dmaven.test.skip=true' -Psetup

This is because the Entities used in the tests may not have been defined yet in the application code
