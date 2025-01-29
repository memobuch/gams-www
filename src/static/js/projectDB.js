
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
     * 
     * @param {string} searchString 
     */
    const fulltextSearch = (searchString, callback = null) => {

        (async () => {
            resultObjects = await getDB().digital_objects
                .where("props.fulltext")
                .startsWithIgnoreCase(searchString)
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

    const getDB = () => {
        return _DB;
    }

    const setDB = (db) => {
        _DB = db;
    }



    


    return {
        initDB,
        fulltextSearch
    };

}))();

// Expose the db object
// window.gams.projectDB = projectDB;