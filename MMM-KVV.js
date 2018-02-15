/* Magic Mirror
 * Module: MMM-KVV
 *
 * By yo-less / https://github.com/yo-less
 * MIT Licensed.
 * 
 * v1.0.3
 */

Module.register("MMM-DLijn", {

    defaults: {
        apiBase: 'https://www.delijn.be/rise-api-core/haltes/vertrekken/',
        stopID: '102675',
        maxConn: '8',
        lines: '',
        direction: '',
        labelRow: true,
        stopName: 'De Lijn',
        reload: 1 * 60 * 1000       // every minute
    },

    getTranslations: function () {
        return {
            en: "translations/en.json",
            de: "translations/de.json",
            nl_be: "translations/nl_be.json"
        };
    },

    getStyles: function () {
        return ["MMM-KVV.css"];
    },

    start: function () {
        var self = this;
        Log.info("Starting module: " + this.name);
        this.sendSocketNotification("CONFIG", this.config);
        setInterval(
            function () {
                self.sendSocketNotification("CONFIG", self.config);
            }
            , this.config.reload);
    },


    socketNotificationReceived: function (notification, payload) {
        if (notification === "TRAMS" + this.config.stopID) {
            this.kvv_data = payload;
            this.config.stopName = payload.stopName;
            this.updateDom();
        }
    },

    getDom: function () {


        // Auto-create MagicMirror header

        var wrapper = document.createElement("div");
        // var header = document.createElement("header");
        // header.innerHTML = this.config.stopName;
        // wrapper.appendChild(header);


        // Loading data notification

        if (!this.kvv_data) {
            var text = document.createElement("div");
            text.innerHTML = this.translate("LOADING");
            text.className = "small dimmed";
            wrapper.appendChild(text);

        } else {

            // Start creating connections table

            var table = document.createElement("table");
            table.classList.add("small", "table");
            table.border = '0';


            // Check if there are any connections before adding a label row

            var counter = 0;

            for (var f in this.kvv_data.lijnen) {

                var tram = this.kvv_data.lijnen[f];

                if (this.config.lines !== '') {

                    if (this.kvv_lines(tram.lijnNummer, this.config.lines)) {

                        if (this.config.direction === '1') {
                            if (tram.bestemming === '1') {
                                counter = counter + 1;
                            }
                        } else if (this.config.direction === '2') {
                            if (tram.bestemming === '2') {
                                counter = counter + 1;
                            }
                        } else {
                            counter = counter + 1;
                        }
                    }

                } else {

                    if (this.config.direction === '1') {
                        if (tram.bestemming === '1') {
                            counter = counter + 1;
                        }
                    } else if (this.config.direction === '2') {
                        if (tram.bestemming === '2') {
                            counter = counter + 1;
                        }
                    } else {
                        counter = counter + 1;
                    }
                }

            }

            if (counter > 0 && this.config.labelRow) {
                table.appendChild(this.createLabelRow());
            }

            table.appendChild(this.createSpacerRow());

            // Listing selected connections
            var counter = 0;

            for (var f in this.kvv_data.lijnen) {

                var tram = this.kvv_data.lijnen[f];

                if (this.config.lines !== '') {

                    if (this.kvv_lines(tram.lijnNummer, this.config.lines)) {

                        if (this.config.direction === '1') {
                            if (tram.bestemming === '1') {
                                table.appendChild(this.createDataRow(tram));
                                counter = counter + 1;
                            }
                        } else if (this.config.direction === '2') {
                            if (tram.bestemming === '2') {
                                table.appendChild(this.createDataRow(tram));
                                counter = counter + 1;
                            }
                        } else {
                            table.appendChild(this.createDataRow(tram));
                            counter = counter + 1;
                        }
                    }

                } else {

                    if (this.config.direction === '1') {
                        if (tram.bestemming === '1') {
                            table.appendChild(this.createDataRow(tram));
                            counter = counter + 1;
                        }
                    } else if (this.config.direction === '2') {
                        if (tram.bestemming === '2') {
                            table.appendChild(this.createDataRow(tram));
                            counter = counter + 1;
                        }
                    } else {
                        table.appendChild(this.createDataRow(tram));
                        counter = counter + 1;
                    }
                }

            }

            if (counter == 0) {

                if (!this.hidden) {
                    table.appendChild(this.createNoTramRow());
                    wrapper.appendChild(table);
                    this.hide(10000);
                }

            } else {

                if (this.hidden) {
                    this.show(5000);
                }

                wrapper.appendChild(table);
            }

        }

        return wrapper;

    },

    // Function checking whether a line is wanted by the user

    kvv_lines: function (queried_line, lines_config) {

        //Remove spaces in the config parameter (if any)
        var lines_clean = lines_config.replace(/\s+/g, '');

        //Create a line array from the config parameter
        var lines_array = lines_clean.split(",");

        //Check if the line in question is in the config

        for (var i = 0; i < lines_array.length; i++) {
            if (lines_array[i] == queried_line) {
                return true;
            }
        }
        return false;
    },

    createLabelRow: function () {
        var labelRow = document.createElement("tr");

        var lineLabel = document.createElement("th");
        lineLabel.className = "line";
        lineLabel.innerHTML = this.translate("LINE");
        labelRow.appendChild(lineLabel);

        var destinationLabel = document.createElement("th");
        destinationLabel.className = "destination";
        destinationLabel.innerHTML = this.translate("DESTINATION");
        labelRow.appendChild(destinationLabel);

        var departureLabel = document.createElement("th");
        departureLabel.className = "departure";
        departureLabel.innerHTML = this.translate("DEPARTURE");
        labelRow.appendChild(departureLabel);

        return labelRow;
    },

    createSpacerRow: function () {
        var spacerRow = document.createElement("tr");

        var spacerHeader = document.createElement("th");
        spacerHeader.className = "spacerRow";
        spacerHeader.setAttribute("colSpan", "3");
        spacerHeader.innerHTML = "";
        spacerRow.appendChild(spacerHeader);

        return spacerRow;
    },


    createNoTramRow: function () {
        var noTramRow = document.createElement("tr");

        var noTramHeader = document.createElement("th");
        noTramHeader.className = "noTramRow";
        noTramHeader.setAttribute("colSpan", "3");
        noTramHeader.innerHTML = this.translate("NO-TRAMS");
        noTramRow.appendChild(noTramHeader);

        return noTramRow;
    },

    createDataRow: function (data) {
        var row = document.createElement("tr");

        var line = document.createElement("td");
        line.className = "line";
        line.innerHTML = data.lijnNummer;
        row.appendChild(line);

        var destination = document.createElement("td");
        destination.innerHTML = data.bestemming;
        row.appendChild(destination);

        var departure = document.createElement("td");
        departure.className = "departure";
        if (data.vertrekTijd == "0") {
            departure.innerHTML = this.translate("NOW");
        } else if (data.vertrekTijd.charAt(2) == ":") {	// Append "Uhr" to data given in "hh:mm" format if config language is German
            departure.innerHTML = data.vertrekTijd + this.translate("TIME");
        } else if (data.vertrekTijd.substr(data.vertrekTijd.length - 5) == "1 min") {
            departure.innerHTML = 'In ' + data.vertrekTijd.slice(0, -4) + ' ' + this.translate("MINUTE"); // Give remaining time as 'In 1 minute' rather than as '1 min'
        } else if (data.vertrekTijd.substr(data.vertrekTijd.length - 3) == "min") {
            departure.innerHTML = 'In ' + data.vertrekTijd.slice(0, -4) + ' ' + this.translate("MINUTES"); // Give remaining time as 'in d minutes' rather than as '\d min'
        } else {
            departure.innerHTML = data.vertrekTijd;
        }
        row.appendChild(departure);

        return row;
    }

});