
window.gams = {}

window.gams.projectDB = ((() => {

    /**
     * Abbreviation of the project
     * //TODO outdate this variable
     */
    let PROJECT_ABBR;

    /**
     * Reference to the dexie database
     */
    let _DB;


    /**
     * Initializes and (if empty) populates the database with data from the provided project.
     * Allows to expire the database and rebuild it from scratch via defining an expiration date.
     * @param {string} projectAbbr abbreviation of the GAMS project.
     * @param {Date} expirationDate If lower than the current date -> rebuild the database from srcatch.
     * @param {number} version Version number of the dexie database.
     * TODO rename method
     */
    const initDB = (projectAbbr, expirationDate = new Date("9999-01-31"), version = 1) => {

        // TODO outdated assignment? careful!  needs to be available for protoype

        PROJECT_ABBR = projectAbbr;

        (async () => {

            // Create or connect to the database
            let dexieDb = new Dexie(projectAbbr + "_db");
            setDB(dexieDb);
            dexieDb.version(version).stores({
                digital_objects: `
                        ++id,
                        db.id,
                        *dc.type,
                        *props.fulltext,
                        *db.baseMetadata.title,
                        *db.baseMetadata.description
                    `,
            });
            
            if(Date.now() > expirationDate) {
                console.warn(`ProjectDB expired. Deleting and rebuilding database. Got expiration date: ${expirationDate.toString()}`);
                // delete db
                getDB().delete();
                // then call method again (with largest possible expiration date?)
                return initDB(projectAbbr, new Date("9999-01-31"), version);
            }

            // surround with try/catch
            let digitalObjectsCount = await getDB().digital_objects.count();

            if (digitalObjectsCount > 0) {
                // TODO instead return something that indicates already populated or not?
                console.log("Database already populated with data");
                // Emit custom event
                // TODO refactor event handling
                const event = new CustomEvent("projectDB_populated");
                document.dispatchEvent(event);
                return;
            }

            
            let projectJsonLocation = `/${PROJECT_ABBR}/object_index.json`;

            console.log("Populating database with data from: ", projectJsonLocation);
            // TODO surrond with try catch
            const data = await fetch( projectJsonLocation).then(response => response.json());
            await getDB().digital_objects.bulkPut(data);

            //console.log("Populated database with data from: ", data);
            //return data;

            // Emit custom event
            const event = new CustomEvent("projectDB_populated");
            document.dispatchEvent(event);

        })();
    };


    /**
     * Quick fulltext search allowing follow up actions on each result entry via callback function.
     * Does not wait for the complete database result -> allows dynamic ("on-found") update of display.
     * @param {string} searchString 
     * @param {function} callback What to do with a singular result entry.
     */
    const fulltextSearch = (searchString, callback) => {

        // TODO error if under 3 characters?
        if (searchString.length < 3) {
            let msg = "Search string must be at least 3 characters long";
            console.error(msg);
            throw new RangeError(msg);
        } 

        // async function could be used to await
        (async () => {
            resultObjects = getDB().digital_objects
                .where("props.fulltext")
                //.startsWithIgnoreCase(searchString)
                .anyOfIgnoreCase(searchString)
                .each(callback);
        })();

    }

    /**
     * Performs a fulltext search and returns the result inside an array for follow up sorting, pagination etc.
     * More expensive operation than just fulltextSearch. 
     * Waits for the complete database result
     * @param {string} searchString String to be searched
     * @param {function} callback Function to be called with the result array
     */
    const fulltextSearchAwait = (searchString, callback) => {

        // TODO error if under 3 characters?
        if (searchString.length < 3) {
            let msg = "Search string must be at least 3 characters long";
            console.error(msg);
            throw new RangeError(msg);
        } 

        (async () => {
            resultObjects = await getDB().digital_objects
                .where("props.fulltext")
                .anyOfIgnoreCase(searchString)
                // more expensive operation
                .toArray();    

            // if provided, call the callback function
            callback(resultObjects);
            
        })();

    }

    /**
     * Returns the object(s) with the provided id
     * @param {string} id id of object to be found
     * @param {function} callback function to be called with the result object(s)
     * @returns {Array<Object>} object(s) with the provided id
     */
    const idSearch = (id, callback = null) => {
        (async () => {
            resultObjects = await getDB().digital_objects
                .where("db.id")
                .anyOfIgnoreCase(id)
                // TODO seems like an exepnsive operation!
                .toArray();    

            // Emit custom event
            const event = new CustomEvent("projectDB_idsearch_hit", { detail: resultObjects });
            document.dispatchEvent(event);

            // if provided, call the callback function
            if(callback)
                callback(resultObjects);
            
        })();
    }

    /**
     * Returns the object(s) with the provided id
     * @param {Array<string>} types dc types to be found
     * @param {function} callback function to be called with the result object(s)
     * @returns {Array<Object>} object(s) with the provided id
     * 
     */
    const dcTypeSearch = (types, callback) => {
        (async () => {
            getDB().digital_objects
                .where("dc.type")
                .anyOfIgnoreCase(types)
                .each(callback);
        })();
    }

    /** 
     * 
    */
    const advancedSearch = (searchString, callback = null) => {



    }


    const getDB = () => {
        return _DB;
    }

    const setDB = (db) => {
        _DB = db;
    }



    


    return {
        dcTypeSearch,
        initDB,
        idSearch,
        fulltextSearch
    };

}))();

// Expose the db object
// window.gams.projectDB = projectDB;