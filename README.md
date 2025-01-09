# gams--www
Contains logic for generating the memo frontend via using the GAMS-SSR tool. 


### Basic usage

1. Clone project files
2. Run GAMS-SSR tool -> via pointing to the cloned folder (and current project "memo")
3. Check generated page on http://locahlhost:18090/


```sh
# Example GAMS-SSR startup
pollin "memo" "C:\Users\sebas\Documents\programming\gams\memo_www" start

# alternatively set a custom host and port 
pollin -h "http://143.50.30.162:18085/" "memo" "C:\Users\sebas\Documents\programming\gams\memo_www" start 8080

```


