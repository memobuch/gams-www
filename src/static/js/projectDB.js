
window.gams = {}

window.gams.projectDB = ((() => {

    /**
     * Reference to the dexie database
     */
    let _DB;

    /**
     * Schema declaration for the dexie database (digital_objects table)
     */
    const DEXIE_DB_SCHEME = {digital_objects: `
        ++id,
        db.id,
        *dc.type,
        *props.fulltext,
        *db.baseMetadata.title,
        *db.baseMetadata.description
    `};

    /**
     * TODO 
     * https://stackoverflow.com/questions/74997548/does-js-support-multi-threading-now
     * @param {*} projectAbbr 
     * @param {*} expirationDate 
     * @param {*} version 
     */
    const populateDatabase = (projectAbbr, version = 1) => {

        let workerArgs = {projectAbbr: projectAbbr, version: version, DEXIE_DB_SCHEME: DEXIE_DB_SCHEME};

        // This function will be passed into the worker
        // TODO rename function
        function test(message) {

            // import dexie js
            importScripts('https://cdn.jsdelivr.net/npm/dexie@3.0.3/dist/dexie.min.js');

            console.log("Worker received arguments: ", message.data);

            const data = message.data;
        
            // ensures availability in the async functionbelow
            let projectAbbr = message.data.projectAbbr;

            (async () => {
                // load parse and index via dexie
                // TODO think about hardcoded location?
                let projectJsonLocation = `http://localhost:18090//${projectAbbr}/object_index.json`;

                let dbData;
                try {
                    dbData = await fetch( projectJsonLocation).then(response => response.json());
                } catch (error) {
                    const MSG = `Could not fetch project data from ${projectJsonLocation}. Might also be a problem related to json parsing. Make sure that a valid json is available under the specified location. Got error: ${error}`;
                    console.error(MSG);
                    return;
                }

                let dexieDb = new Dexie(projectAbbr + "_db");
                // TODO code duplication
                const DB_SCHEME = message.data.DEXIE_DB_SCHEME;
                const VERSION = message.data.version;
                // TODO apply version?
                dexieDb.version(VERSION).stores(DB_SCHEME);
                console.log("Worker: Inserting data into db!!");

                await dexieDb.digital_objects.bulkPut(dbData);
                console.log("Worker: Inserted data into db!!");
                console.log("Worker: posting now to outside");
                // Response
                postMessage(data);
            })();            
        }

        // Dynamic creation of a worker
        const bytes = new TextEncoder().encode(`self.onmessage = ${test.toString()}`)
        const blob = new Blob([bytes], {type: 'application/javascript'})
        const url = URL.createObjectURL(blob)
        const worker = new Worker(url)

        // This message will be passed to the 
        worker.postMessage(workerArgs)

        // This function will be called when the worker finishes
        worker.onmessage = (message) => {
            console.log("Received worker finished: ", message);
            // fire custom event when db is ready
            const DB_READY_EVENT = new CustomEvent("PROJECTDB_READY");
            document.dispatchEvent(DB_READY_EVENT);
        }


    }


    /**
     * Initializes and (if empty) populates the database with data from the provided project.
     * Allows to expire the database and rebuild it from scratch via defining an expiration date.
     * @param {string} projectAbbr abbreviation of the GAMS project.
     * @param {Date} expirationDate If lower than the current date -> rebuild the database from srcatch.
     * @param {number} version Version number of the dexie database.
     * TODO rename method
     */
    const initDB = (projectAbbr, expirationDate = new Date("9999-01-31"), version = 1) => {

        (async (projectAbbr) => {

            // Create or connect to the database
            let dexieDb = new Dexie(projectAbbr + "_db");
            setDB(dexieDb);
            dexieDb.version(version).stores(DEXIE_DB_SCHEME);
            
            if(Date.now() > expirationDate) {
                console.warn(`ProjectDB expired. Deleting and rebuilding database. Got expiration date: ${expirationDate.toString()}`);
                // delete db
                getDB().delete();
                // then call method again (with largest possible expiration date?)
                return initDB(projectAbbr, new Date("9999-01-31"), version);
            }

            
            let digitalObjectsCount = await getDB().digital_objects.count();
            if (digitalObjectsCount > 0) {
                // TODO instead return something that indicates already populated or not?
                const DB_READY_EVENT = new CustomEvent("PROJECTDB_READY");
                document.dispatchEvent(DB_READY_EVENT);
                return;
            }


            populateDatabase(projectAbbr, version);


            // outdated blocking filling of database

            // 
            // let projectJsonLocation = `/${projectAbbr}/object_index.json`;

            // let data;
            // try {
            //     data = await fetch( projectJsonLocation).then(response => response.json());
            // } catch (error) {
            //     const MSG = `Could not fetch project data from ${projectJsonLocation}. Might also be a problem related to json parsing. Make sure that a valid json is available under the specified location. Got error: ${error}`;
            //     console.error(MSG);
            //     return;
            // }
            
            // await getDB().digital_objects.bulkPut(data);

            // // Emit db ready event
            // document.dispatchEvent(DB_READY_EVENT);

        // passing of argument ensures that project is defined in inner scope
        })(projectAbbr);
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