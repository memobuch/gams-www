# gams--www
Contains logic for generating the memor frontend via using the GAMS-SSR tool. 


### Basic usage

1. Clone project files
2. Run GAMS-SSR tool -> via pointing to the cloned folder (and current project "memor")
3. Check generated page on http://locahlhost:18090/


```sh
# Example GAMS-SSR startup
cd "/path/to/my/gams_www" 
frog dev

# alternatively set a custom host and port 
frog -h "http://143.50.30.162:18085/" dev 8080

```


