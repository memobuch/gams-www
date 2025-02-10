
window.gams = {}

window.gams.projectDB = ((() => {

    /**
     * Abbreviation of the project
     */
    let PROJECT_ABBR;

    /**
     * Reference to the dexie database
     */
    let _DB;


    /**
     * 
     */
    const initDB = (projectAbbr) => {

        PROJECT_ABBR = projectAbbr;

        (async () => {
            
            //PROJECT_ABBR = projectAbbr;

            console.log("Creating database for project: ", projectAbbr);

            // Create or connect to the database
            let dexieDb = new Dexie(projectAbbr + "_db");
            setDB(dexieDb);
            dexieDb.version(1).stores({
                digital_objects: `
                        ++id,
                        db.id,
                        *dc.type,
                        *props.fulltext,
                        *db.baseMetadata.title,
                        *db.baseMetadata.description
                    `,
            });

            // surround with try/catch
            let digitalObjectsCount = await getDB().digital_objects.count();

            if (digitalObjectsCount > 0) {
                console.log("Database already populated with data");
                // Emit custom event
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
     * TODO jsdoc
     * @param {string} searchString 
     */
    const fulltextSearch = (searchString, callback = null) => {

        // TODO error if under 3 characters?
        if (searchString.length < 3) {
            let msg = "Search string must be at least 3 characters long";
            console.error(msg);
            throw new RangeError(msg);
        } 

        (async () => {
            resultObjects = await getDB().digital_objects
                .where("props.fulltext")
                //.startsWithIgnoreCase(searchString)
                .anyOfIgnoreCase(searchString)
                // TODO seems like an exepnsive operation!
                .toArray();    

            // console.log("Found objects for query:", searchString, resultObjects);

            // Emit custom event
            const event = new CustomEvent("projectDB_fulltext_hit", { detail: resultObjects });
            document.dispatchEvent(event);

            // if provided, call the callback function
            if(callback)
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