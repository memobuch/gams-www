
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
     * TODO add database versioning 
     * @param {string} projectAbbr
     */ 
    const init = (projectAbbr) => {
        // somehow doesn't work with template string
        let dexieDb = new Dexie(projectAbbr + "_db");
        dexieDb.version(1).stores({
            digital_objects: `
                    db.id,
                    *props.fulltext,
                    *db.baseMetadata.title,
                    *db.baseMetadata.description
                `,
        });
        setDB(dexieDb);

        PROJECT_ABBR = projectAbbr;
        console.log("Initiating dexie database for project:  ", PROJECT_ABBR);


        //////////////////////////////
        ////
        // TRYING TO ADD A FULTEXT INDEX at client side

        // Add hooks that will index "message" for full-text search:
        // db.digital_objects.hook("creating", function (primKey, obj, trans) {
        //     console.log("Creating hook for", obj);
        //     if (typeof obj.message == 'string') {
        //         console.log("Creating hook for", obj);
        //         obj.fulltextWords = getAllWords(obj.db.baseMetadata.description);
        //     }
        // });

        // Add hooks that will index "message" for full-text search:
        // getDB().digital_objects.hook("updating", function (mods, primKey, obj, trans) {
        //     return { fulltextWords: getAllWords(obj.db.baseMetadata.description) };
        // });
    };

    /**
     * 
     */
    const populateDB = () => {
        (async () => {

            let projectJsonLocation = `/${PROJECT_ABBR}/object_index.json`;

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

    
    

    function getAllWords(text) {
        /// <param name="text" type="String"></param>
        var allWordsIncludingDups = text.split(' ');
        var wordSet = allWordsIncludingDups.reduce(function (prev, current) {
            prev[current] = true;
            return prev;
        }, {});
        return Object.keys(wordSet);
    }


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

        // TODO emit custom event?

    }

    const getDB = () => {
        return _DB;
    }

    const setDB = (db) => {
        _DB = db;
    }



    


    return {
        init,
        populateDB,
        fulltextSearch
    };

}))();

// Expose the db object
// window.gams.projectDB = projectDB;