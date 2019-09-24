var mainSettings = {
    fuelLimit: 15,
    topLimit: 1080,
    bottomLimit: 0
};

$(function () {

    function buildPopup(vehicle) {
        $("#" + vehicle).popover({
            html: true,
            placement: "top",
            content: function () {
                var contentElem = infoWindowBulder.buildContent(vehicle);
                var con = $("<div/>").append(contentElem);
                return con.html();
            },
            title: function () {
                var hederCon = infoWindowBulder.buildTitle(vehicle);
                var hede = $("<div/>").append(hederCon);
                return hede.html();
            }
        }).on("show.bs.popover", function () {
            Vehicles[vehicle].isOpen = true;
            webSocketConnection.send('{"obj":"' + vehicle + '","action": "show"}');
        }).on("hide.bs.popover", function () {
            Vehicles[vehicle].isOpen = false;
            webSocketConnection.send('{"obj":"' + vehicle + '","action": "hide"}');
        });

        $(document).on("click", "#" + vehicle + "-popover-content", function () {
            if (Vehicles[vehicle].isSelected == false) {
                Vehicles[vehicle].isSelected = true;

                var popoverDiv = $(this).parent().parent();

                popoverDiv.addClass("selected");

                webSocketConnection.send('{"obj":"' + vehicle + '","action": "selected"}');
                detailView.open(vehicle);
                for (obj in Vehicles) {
                    if (obj != vehicle && Vehicles[obj].isOpen == true && Vehicles[obj].isSelected == true) {
                        Vehicles[obj].isSelected = false;

                        var lastSelected = $("#" + obj + "-popover-content").parent().parent();
                        webSocketConnection.send('{"obj":"' + obj + '","action": "deselected"}');
                        lastSelected.removeClass("selected");
                    }
                }
            }
        });

        $(document).on("click", "#" + vehicle + "-popover-title", function () {
            if (Vehicles[vehicle].isSelected == false) {
                Vehicles[vehicle].isSelected = true;

                var popoverDiv = $(this).parent().parent();

                popoverDiv.addClass("selected");

                webSocketConnection.send('{"obj":"' + vehicle + '","action": "selected"}');
                detailView.open(vehicle);
                for (obj in Vehicles) {
                    if (obj != vehicle && Vehicles[obj].isOpen == true && Vehicles[obj].isSelected == true) {
                        Vehicles[obj].isSelected = false;

                        var lastSelected = $("#" + obj + "-popover-content").parent().parent();
                        webSocketConnection.send('{"obj":"' + obj + '","action": "deselected"}');
                        lastSelected.removeClass("selected");
                    }
                }
            }
        });

        $("#" + vehicle).draggable();
    }

    //initialization and creating
    buildPopup(Vehicles.mineTruck.id);
    buildPopup(Vehicles.bagger.id);
    buildPopup(Vehicles.driller.id);
    buildPopup(Vehicles.wheelLoaders.id);
    buildPopup(Vehicles.roller.id);

    webSocketConnection.connect();
});

/*--------------------------- infowindow builder ----------------------------*/
var infoWindowBulder = (function () {
    var buildContent = function (id) {
        var vehicle = Vehicles[id];

        var container = $("<div/>").attr("id", vehicle.id + "-popover-content");

        //time working
        var enginWorkingDiv = $("<div/>")
            .addClass("element engin-work")
            .attr("id", vehicle.id + "-enginWorkingDiv")
            .appendTo(container);

        var enginIcon = $("<i/>")
            .addClass("fas fa-cogs fa-3x")
            .attr("id", vehicle.id + "-enginWorkingI")
            .appendTo(enginWorkingDiv);

        var enginWorking = $("<div/>")
            .text(vehicle.dailyWorkTime)
            .attr("id", vehicle.id + "-enginWorking")
            .appendTo(enginWorkingDiv);

        if (vehicle.isIdle == true) {
            enginWorkingDiv.addClass("bg-danger");
        }

        if (vehicle.isWorking) {
            enginWorking.text(vehicle.dailyWorkTime);
        } else {
            enginWorking.text("Off");
        }

        //executed tasks
        var taskDiv = $("<div/>")
            .addClass("element task")
            .appendTo(container);

        var taskIcon = $("<i/>")
            .addClass("fas fa-hammer fa-3x")
            .appendTo(taskDiv);

        var task = $("<div/>")
            .text(vehicle.specialTask)
            .attr("id", vehicle.id + "-task")
            .appendTo(taskDiv);

        //fuel levele
        var fuelLevelDiv = $("<div/>")
            .addClass("element fuel-level")
            .attr("id", vehicle.id + "-fuelLevelDiv")
            .appendTo(container);

        var fuelLevelIcon = $("<i/>")
            .addClass("fas fa-gas-pump fa-3x")
            .appendTo(fuelLevelDiv);

        var fuelLevel = $("<div/>")
            .text(vehicle.fuelLevel + "%")
            .attr("id", vehicle.id + "-fuelLevel")
            .appendTo(fuelLevelDiv);

        if (vehicle.fuelLevel <= mainSettings.fuelLimit) {
            fuelLevelDiv.addClass("bg-danger");
        }

        //alarm caunt
        var alarmDiv = $("<div/>")
            .addClass("element alarms")
            .attr("id", vehicle.id + "-alarmDiv")
            .appendTo(container);

        var alarmIcon = $("<i/>")
            .addClass("fas fa-bell fa-3x")
            .appendTo(alarmDiv);

        var alarm = $("<div/>")
            .text(vehicle.alarms.length)
            .attr("id", vehicle.id + "-alarm")
            .appendTo(alarmDiv);

        //detected alarms
        var detectedAlarms = $("<div/>")
            .addClass("detected-alarms")
            .attr("id", vehicle.id + "-detectedAlarms")
            .appendTo(container);

        for (var i = 0; i < vehicle.alarms.length; i++) {
            var newAlarm = activateAlarm(vehicle.alarms[i], i);
            if (vehicle.alarms[i].htmlObject != null) {
                vehicle.alarms[i].htmlObject.remove();
                vehicle.alarms[i].htmlObject = null;
            }
            vehicle.alarms[i].htmlObject = newAlarm;
            vehicle.alarms[i].htmlObject.appendTo(detectedAlarms);
        }

        if (vehicle.alarms.length > 0) {
            alarmDiv.addClass("bg-danger");
        }

        return container;
    };

    var activateAlarm = function (alarm, i) {
        var detectedAlarm = $("<div/>")
            .attr("id", i + "-detectedAlarm")
            .addClass("alert alert-danger");

        var detectedAlarmIcon = $("<i/>")
            .css("display", "inline-block")
            .addClass("fas fa-exclamation-triangle")
            .appendTo(detectedAlarm);

        var detectedAlarmDiv = $("<div/>")
            .css("display", "inline-block")
            .text(alarm.text)
            .appendTo(detectedAlarm);

        return detectedAlarm;
    }

    var buildTitle = function (vehicle) {
        var container = $("<div/>");
        container.attr("id", vehicle + "-popover-title");
        container.text(Vehicles[vehicle].name);
        return container;
    };

    var refresh = function (vehicle, changes) {
        //changes = {
        //    fuelLevel: false,
        //    isIdle: false,
        //    isWorking: false,
        //    specialTask: false
        //};

        if (vehicle.isWorking) {
            $("#" + vehicle.id + "-enginWorking").text(vehicle.dailyWorkTime);
        } else {
            $("#" + vehicle.id + "-enginWorking").text("Off");
        }

        //if (changes.dailyWorkTime) shakeAndChange($("#" + vehicle.id + "-enginWorking"), vehicle.dailyWorkTime);
        if (changes.specialTask) shakeAndChange($("#" + vehicle.id + "-task"), vehicle.specialTask);
        if (changes.fuelLevel) {
            shakeAndChange($("#" + vehicle.id + "-fuelLevel"), vehicle.fuelLevel + "%");

            if (vehicle.fuelLevel <= mainSettings.fuelLimit) {
                $("#" + vehicle.id + "-fuelLevelDiv").addClass("bg-danger");
            } else {
                $("#" + vehicle.id + "-fuelLevelDiv").removeClass("bg-danger");
            }
        }

        if (vehicle.isIdle == true) {
            $("#" + vehicle.id + "-enginWorkingDiv").addClass("bg-danger");
        } else {
            $("#" + vehicle.id + "-enginWorkingDiv").removeClass("bg-danger");
        }
    };

    var shakeAndChange = function (elemenet, value) {
        elemenet.text(value);
        elemenet.effect("highlight", {
            color: "#9c9c7e",
            queue: false
        }, 200);
    };

    var addAlarm = function (obj, alarm) {
        var newAlarm = activateAlarm(alarm);
        alarm.htmlObject = newAlarm;
        newAlarm.appendTo("#" + obj + "-detectedAlarms");

        Vehicles[obj].alarms.push(alarm);
        refreshAlarmCount(obj);
    };

    var removeAlarm = function (obj, alarm) {
        for (var i = Vehicles[obj].alarms.length - 1; i >= 0; --i) {
            if (Vehicles[obj].alarms[i].text == alarm.text) {
                $("#" + i + "-detectedAlarm").remove();
                Vehicles[obj].alarms[i].htmlObject.remove();
                Vehicles[obj].alarms.splice(i, 1);
            }
        }
        refreshAlarmCount(obj);
    };

    var refreshAlarmCount = function (obj) {
        var alarmCount = Vehicles[obj].alarms.length;

        if (alarmCount > 0) {
            $("#" + obj + "-alarmDiv").addClass("bg-danger");
        } else {
            $("#" + obj + "-alarmDiv").removeClass("bg-danger");
        }

        shakeAndChange($("#" + obj + "-alarm"), alarmCount);

        if (Vehicles[obj].isSelected) {
            if (alarmCount > 0) {
                $("#" + obj + "-detail-alarmDiv").addClass("bg-danger");
            } else {
                $("#" + obj + "-detail-alarmDiv").removeClass("bg-danger");
            }
            shakeAndChange($("#" + obj + "-detail-alarm"), alarmCount);
        }
        //$("#" + obj).popover('update');
    }

    return {
        buildTitle: buildTitle,
        buildContent: buildContent,
        refresh: refresh,
        addAlarm: addAlarm,
        removeAlarm: removeAlarm
    };

})();

/*--------------------------- detail view ----------------------------*/
var detailView = (function () {

    var open = function (id) {
        var vehicle = Vehicles[id];

        var detailVeiw = $("#detail-view");
        detailVeiw.empty();

        var headerInformationView = $("<div/>").addClass("header-information-view").appendTo(detailVeiw);

        buildHeader(vehicle, headerInformationView);

        var centerInteractiveView = $("<div/>").addClass("center-interactive-view").appendTo(detailVeiw);

        if (vehicle.detailView != null) {
            vehicle.detailViewInstance = new vehicle.detailView(centerInteractiveView);
        }

        var bottomInformationView = $("<div/>").addClass("bottom-information-view").appendTo(detailVeiw);
        buildBottomInformationView(vehicle, bottomInformationView);
    };

    var buildHeader = function (vehicle, div) {

        //time working
        var enginWorkingDiv = $("<div/>")
            .addClass("element engin-work")
            .attr("id", vehicle.id + "-detail-enginWorkingDiv")
            .appendTo(div);

        var enginWorkingDesc = $("<div/>")
            .text("Engine working")
            .appendTo(enginWorkingDiv);

        var enginIcon = $("<i/>")
            .addClass("fas fa-cogs fa-4x")
            .attr("id", vehicle.id + "-detail-enginWorkingI")
            .appendTo(enginWorkingDiv);

        var enginWorking = $("<div/>")
            .text(vehicle.dailyWorkTime)
            .attr("id", vehicle.id + "-detail-enginWorking")
            .appendTo(enginWorkingDiv);

        if (vehicle.isWorking) {
            enginWorking.text(vehicle.dailyWorkTime);
        } else {
            enginWorking.text("Off");
        }

        var border = $("<div/>").addClass("white-border").appendTo(div);

        //executed tasks
        var taskDiv = $("<div/>")
            .addClass("element task")
            .css({
                "cursor": "pointer"
            })
            .attr("title", "Reset tasks")
            .appendTo(div);

        taskDiv.click(function () {            
            webSocketConnection.send('{"obj":"' + vehicle.id + '","action": "resetTask"}');
        });

        var taskDesc = $("<div/>")
            .text("Special task")
            .appendTo(taskDiv);

        var taskIcon = $("<i/>")
            .addClass("fas fa-hammer fa-4x")
            .appendTo(taskDiv);

        var task = $("<div/>")
            .text(vehicle.specialTask)
            .attr("id", vehicle.id + "-detail-task")
            .appendTo(taskDiv);

        var border2 = $("<div/>").addClass("white-border").appendTo(div);

        //fuel levele
        var fuelLevelDiv = $("<div/>")
            .addClass("element fuel-level")
            .attr("id", vehicle.id + "-detail-fuelLevelDiv")
            .appendTo(div);

        var fuelLevelDesc = $("<div/>")
            .text("Fuel level")
            .appendTo(fuelLevelDiv);

        var fuelLevelIcon = $("<i/>")
            .addClass("fas fa-gas-pump fa-4x")
            .appendTo(fuelLevelDiv);

        var fuelLevel = $("<div/>")
            .text(vehicle.fuelLevel + "%")
            .attr("id", vehicle.id + "-detail-fuelLevel")
            .appendTo(fuelLevelDiv);

        if (vehicle.fuelLevel <= mainSettings.fuelLimit) {
            fuelLevelDiv.addClass("bg-danger");
        }

        var border3 = $("<div/>").addClass("white-border").appendTo(div);

        //alarm caunt
        var alarmDiv = $("<div/>")
            .addClass("element alarms")
            .attr("id", vehicle.id + "-detail-alarmDiv")
            .appendTo(div);

        var alarmDesc = $("<div/>")
            .text("Alarms")
            .appendTo(alarmDiv);

        var alarmIcon = $("<i/>")
            .addClass("fas fa-bell fa-4x")
            .appendTo(alarmDiv);

        var alarm = $("<div/>")
            .text(vehicle.alarms.length)
            .attr("id", vehicle.id + "-detail-alarm")
            .appendTo(alarmDiv);

        var border4 = $("<div/>").addClass("white-border").appendTo(div);

        //alarm caunt
        var totalAlarmCountDiv = $("<div/>")
            .addClass("element alarms")
            .attr("id", vehicle.id + "-total-alarmDiv")
            .appendTo(div);

        var totalAlarmCountDesc = $("<div/>")
            .text("Total alarm count")
            .appendTo(totalAlarmCountDiv);

        var totalAlarmCountIcon = $("<i/>")
            .addClass("fas fa-bell fa-4x")
            .appendTo(totalAlarmCountDiv);

        var totalAlarmCount = $("<div/>")
            .text(vehicle.totalAlarmCount)
            .attr("id", vehicle.id + "-total-alarm")
            .appendTo(totalAlarmCountDiv);

        var border5 = $("<div/>").addClass("white-border").appendTo(div);

        //alarm caunt
        var alarmAvgCountDiv = $("<div/>")
            .addClass("element alarms")
            .attr("id", vehicle.id + "-timeSinceLastAlarmDiv")
            .appendTo(div);

        var alarmAvgDesc = $("<div/>")
            .text("Time since last alarm")
            .appendTo(alarmAvgCountDiv);

        var alarmAvgIcon = $("<i/>")
            .addClass("fas fa-bell fa-4x")
            .appendTo(alarmAvgCountDiv);

        var alarmAvgCount = $("<div/>")
            .text(vehicle.timeSinceLastAlarm)
            .attr("id", vehicle.id + "-timeSinceLastAlarm")
            .appendTo(alarmAvgCountDiv);

    };

    var refreshHeader = function (vehicle, changes) {
        //changes = {
        //    fuelLevel: false,
        //    isIdle: false,
        //    isWorking: false,
        //    specialTask: false
        //};

        if (vehicle.isWorking) {
            $("#" + vehicle.id + "-detail-enginWorking").text(vehicle.dailyWorkTime);
        } else {
            $("#" + vehicle.id + "-detail-enginWorking").text("Off");
        }

        //if (changes.dailyWorkTime) shakeAndChange($("#" + vehicle.id + "-enginWorking"), vehicle.dailyWorkTime);
        if (changes.specialTask) shakeAndChange($("#" + vehicle.id + "-detail-task"), vehicle.specialTask);
        if (changes.fuelLevel) {
            shakeAndChange($("#" + vehicle.id + "-detail-fuelLevel"), vehicle.fuelLevel + "%");

            if (vehicle.fuelLevel <= mainSettings.fuelLimit) {
                $("#" + vehicle.id + "-detail-fuelLevelDiv").addClass("bg-danger");
            } else {
                $("#" + vehicle.id + "-detail-fuelLevelDiv").removeClass("bg-danger");
            }
        }

        if (vehicle.totalAlarmCount) {
            $("#" + vehicle.id + "-total-alarm").text(vehicle.totalAlarmCount);
        } 

        if (vehicle.timeSinceLastAlarm) {
            $("#" + vehicle.id + "-timeSinceLastAlarm").text(vehicle.timeSinceLastAlarm);
        } 

        if (vehicle.isIdle == true) {
            $("#" + vehicle.id + "-detail-enginWorkingDiv").addClass("bg-danger");
        } else {
            $("#" + vehicle.id + "-detail-enginWorkingDiv").removeClass("bg-danger");
        }
    };

    var shakeAndChange = function (elemenet, value) {
        elemenet.text(value);
        elemenet.effect("highlight", {
            color: "#9c9c7e",
            queue: false
        }, 200);
    };

    var buildBottomInformationView = function (vehicle, div) {
        vehicle.sensorsDiv = div;
        var listObSensors = vehicle.sensors;



        for (var i = 0; i < listObSensors.length; i++) {
            var sensorData = listObSensors[i];
            var sensor = Sensors[sensorData.id];

            var sensorDetailView = $("<div/>").addClass("sensor-detail-view").appendTo(div);

            var sensorImage = $("<img/>").addClass("sensor-image").attr("src", "./images/sensors/" + sensor.img).appendTo(sensorDetailView);

            var divSensor = $("<div/>").addClass("sensor-data").appendTo(sensorDetailView);

            var sensorNameHtml = $.parseHTML("<strong>Name: </strong>" + sensor.name);
            var sensorName = $("<div/>").addClass("sensor-name").append(sensorNameHtml).appendTo(divSensor);

            var sensorArtNoHtml = $.parseHTML("<strong>Art. No: </strong>" + sensor.artNo);
            var sensorArtNo = $("<div/>").addClass("sensor-art-no").append(sensorArtNoHtml).appendTo(divSensor);

            var sensorRawDataDiv = $("<div/>").addClass("raw-data").appendTo(sensorDetailView);

            sensor.instance = new sensor.build(sensorRawDataDiv, sensorData);
        }
    };

    var refresh = function (vehicle, newData) {

        newData.unshift({
            id: "tdc"
        });

        if (vehicle.sensors.length > 0) {
            for (var i = 0; i < newData.length; i++) {
                var sensor = newData[i];

                for (var i = 0; i < vehicle.sensors.length; i++) {
                    if (vehicle.sensors[i].id == sensor.id) {
                        Sensors[sensor.id].instance.refresh(vehicle.sensors[i], sensor);
                        vehicle.sensors[i] = sensor;
                        break;
                    }
                }
            }
        } else {

            vehicle.sensors = newData;
            buildBottomInformationView(vehicle, vehicle.sensorsDiv);
        }
    };

    return {
        open: open,
        refresh: refresh,
        refreshHeader: refreshHeader
    };
})();


/*--------------------------- vehicle data ----------------------------*/
var Vehicles = {
    mineTruck: {
        id: "mineTruck",
        name: "(Dump) Truck",
        icon: "",
        dailyWorkTime: "00:00:00",
        specialTask: 0,
        alarms: [],
        fuelLevel: 20,
        isWorking: false,
        isIdle: false,
        isSelected: false,
        isOpen: false,
        sensors: [],
        detailViewInstance: null,
        totalAlarmCount: 0,
        timeSinceLastAlarm: "00:00:00",
        detailView: function (div, data) {
            var self = this;

            var w = div.width(), h = div.height();
            var c = Raphael(div[0], w, h);

            c.setViewBox(0, 0, w, h, true);
            c.setSize("100%", "100%");

            var dw = w * 0.7;
            var dh = dw * 0.5;

            var body = c.image("./images/animation/mineTruck/dump_body.png", w / 2 - dw / 2, h / 2 - dh / 6.5, dw, dh);

            var joint = {
                x: w / 2 - dw / 2 + dw * 0.7345,
                y: h / 2 - dh / 6.5 + dh * 0.4649
            };

            var bed = c.image("./images/animation/mineTruck/dump_bed.png", w / 2 - dw / 2, h / 2 - dh / 6.5, dw, dh);
            c.circle(joint.x, joint.y, dw * 0.01).attr({ fill: "#121213", stroke: "none" });

            self.refresh = function (a) {
                if (a > mainSettings.topLimit || a < mainSettings.bottomLimit) return false;
                if (mainSettings.bottomLimit < 0) a += Math.abs(mainSettings.bottomLimit);
                //if (a > 35 || a < 0) return false;

                a = a / 30;

                var d = Math.abs(bed.matrix.split().rotate - a);
                bed.animate({ transform: "r" + a + "," + joint.x + "," + joint.y }, d * 7);
            }
        }
    },
    bagger: {
        id: "bagger",
        name: "Excavator",
        icon: "",
        dailyWorkTime: "00:00:00",
        specialTask: 0,
        alarms: [],
        fuelLevel: 20,
        isWorking: false,
        isIdle: false,
        isSelected: false,
        isOpen: false,
        sensors: [],
        detailViewInstance: null,
        totalAlarmCount: 0,
        timeSinceLastAlarm: "00:00:00",
        detailView: function (div, data) {
            var self = this;

            var divWidth = div.width()
            var divHeight = div.height();

            var raphael = Raphael(div[0], divWidth, divHeight);

            var dw = divWidth * 0.65;
            var dh = dw * 0.5;

            var body = raphael.image("./images/animation/digger/digger_body.png", (divWidth / 2 - dw / 2.5), divHeight / 2 - dh / 2, dw, dh);

            var joint = {
                x: (divWidth / 2 - dw / 2.5) + dw * 0.01,
                y: divHeight / 2 - dh / 2 + dh * 0.06
            };

            var hh = dh, hw = hh * 0.5;
            var hoe = raphael.image("./images/animation/digger/digger_hoe.png", (joint.x - hw * 0.38), joint.y - hh * 0.19, hw, hh);

            raphael.circle(joint.x, joint.y, dw * 0.02).attr({ fill: "#7E8A96", stroke: "none" });

            self.refresh = function (a) {
                if (a > mainSettings.topLimit || a < mainSettings.bottomLimit) return false;
                if (mainSettings.bottomLimit < 0) a += Math.abs(mainSettings.bottomLimit);
                //if(a > 70 || a < -20) return false;

                a = a / 12;
                a = 90 - a;
                a -= 30;

                var d = Math.abs(hoe.matrix.split().rotate - a);
                hoe.animate({ transform: "r" + a + "," + joint.x + "," + joint.y }, d * 7);
            }
        }
    },
    driller: {
        id: "driller",
        name: "Drillrig",
        icon: "",
        dailyWorkTime: "00:00:00",
        specialTask: 0,
        alarms: [],
        fuelLevel: 20,
        isWorking: false,
        isIdle: false,
        isSelected: false,
        isOpen: false,
        sensors: [],
        detailViewInstance: null,
        totalAlarmCount: 0,
        timeSinceLastAlarm: "00:00:00",
        detailView: function (div, data) {
            var self = this;

            var w = div.width(), h = div.height();
            var c = Raphael(div[0], w, h);

            c.setViewBox(0, 0, w, h, true);
            c.setSize('100%', '100%');

            var dh = h * 0.9, dw = dh * 0.5;
            var body = c.image("./images/animation/driller/driller_body.png", w / 2 - dw / 2, h / 2 - dh / 2, dw, dh);

            var arm = c.image("./images/animation/driller/driller_arm.png", w / 2 - dw / 2, h / 2 - dh / 2, dw, dh);
            var drill = c.image("./images/animation/driller/driller_drill.png", w / 2 - dw / 2, h / 2 - dh / 2, dw, dh);

            var lp = { x: w / 2 - dw / 2 + dw * 0.068, y1: h / 2 - dh / 2 + dh * 0.0253, y2: h / 2 - dh / 2 + dh * 0.63 };
            var line = c.path("M" + lp.x + ',' + lp.y1 + "L" + lp.x + ',' + lp.y2);

            drill.toBack();
            line.toBack();

            self.refresh = function (a) {
                if (a > mainSettings.topLimit || a < mainSettings.bottomLimit) return false;
                if (mainSettings.bottomLimit < 0) a += Math.abs(mainSettings.bottomLimit);
                //if (a > 230 || a < 0) return false;
                //if (a > 35 || a < 0) return false;

                a = a / 10;

                var d = Math.abs(drill.matrix.split().dy - a);
                drill.animate({ transform: ["T", 0, a / 100 * 0.3 * dh] }, d * 3);
            }
        }
    },
    wheelLoaders: {
        id: "wheelLoaders",
        name: "Wheel loader",
        icon: "",
        dailyWorkTime: "00:00:00",
        specialTask: 0,
        alarms: [],
        fuelLevel: 20,
        isWorking: false,
        isIdle: false,
        isSelected: false,
        isOpen: false,
        sensors: [],
        detailViewInstance: null,
        totalAlarmCount: 0,
        timeSinceLastAlarm: "00:00:00",
        detailView: function (div, data) {
            var self = this;

            var w = div.width(), h = div.height();
            var c = Raphael(div[0], w, h);

            c.setViewBox(0, 0, w, h, true);
            c.setSize('100%', '100%');

            var dw = w * 0.75, dh = dw * 0.5;
            var body = c.image("./images/animation/wheelLoaders/frontloader_body.png", w / 2 - dw / 2, h / 1.5 - dh / 2, dw, dh);

            var joint = { x: w / 2 - dw / 2 + dw * 0.4507, y: h / 1.5 - dh / 2 + dh * 0.4274 };

            var hoe = c.image("./images/animation/wheelLoaders/frontloader_hoe.png", w / 2 - dw / 2, h / 1.5 - dh / 2, dw, dh);
            hoe.toBack();

            c.circle(joint.x, joint.y, dw * 0.01).attr({ fill: '#121213', stroke: 'none' });


            self.refresh = function (a) {
                if (a > mainSettings.topLimit || a < mainSettings.bottomLimit) return false;
                if (mainSettings.bottomLimit < 0) a += Math.abs(mainSettings.bottomLimit);
                //if (a > 50 || a < 0) return false;

                a = a / 22;

                var d = Math.abs(hoe.matrix.split().rotate - a)
                hoe.animate({ transform: "r" + a + "," + joint.x + "," + joint.y }, d * 4);
            }

        }
    },
    roller: {
        id: "roller",
        name: "Roller",
        icon: "",
        dailyWorkTime: "00:00:00",
        specialTask: 0,
        alarms: [],
        fuelLevel: 20,
        isWorking: false,
        isIdle: false,
        isSelected: false,
        isOpen: false,
        sensors: [],
        detailViewInstance: null,
        totalAlarmCount: 0,
        timeSinceLastAlarm: "00:00:00",
        detailView: function (div, data) {
            var self = this;

            var w = div.width(), h = div.height();
            var c = Raphael(div[0], w, h);

            c.setViewBox(0, 0, w, h, true);
            c.setSize('100%', '100%');

            var dw = w * 0.8, dh = dw * 0.5;
            var body = c.image('./images/animation/roller/roller.png', w / 2 - dw / 2, h / 2 - dh / 2, dw, dh);


            self.refresh = function (a) {
                if (a > mainSettings.topLimit || a < mainSettings.bottomLimit) return false;
                if (mainSettings.bottomLimit < 0) a += Math.abs(mainSettings.bottomLimit);
                //if (a > 100 || a < -100) return false;

                a = a / 11;
                a -= 100;

                var d = Math.abs(body.matrix.split().dy - a)

                body.animate({ transform: ["T", a / 100 * 0.3 * dw, 0] }, d * 25);

            }

        }
    }
};

var Sensors = {
    lfp: {
        name: "LFP0300",
        artNo: "1057074",
        img: "IM0042102.png",
        build: function (div, data) {
            //id: "lfp"
            //milimeters: 3
            //outputVoltage: "0.109"
            //percentage: 0.010244360655770265
            var self = this;

            var milimetersDiv = $("<div/>").text("Position: " + data.milimeters + " mm").appendTo(div);
            var outputVoltageDiv = $("<div/>").text("Output: " + data.outputVoltage + " V").appendTo(div);
            //var percentageDiv = $("<div/>").text("Percentage: " + data.percentage.toFixed(4)).appendTo(div);

            self.refresh = function (oldData, newData) {
                if (Math.abs(oldData.percentage.toFixed(4) - newData.percentage.toFixed(4)) > 0.005) {
                    changeFunction(milimetersDiv, "Position: ", oldData.milimeters, newData.milimeters, " mm");
                    changeFunction(outputVoltageDiv, "Output: ", oldData.outputVoltage, newData.outputVoltage, " V");
                    //changeFunction(percentageDiv, "Percentage: ", oldData.percentage.toFixed(4), newData.percentage.toFixed(4));
                }
            }
        },
        instance: null
    },
    ahm36b: {
        name: "AHM36 Can Open",
        artNo: "1076867",
        img: "IM0051197.png",
        build: function (div, data) {
            //currentSensorPosition: 1083121
            //id: "ahm36b"
            var self = this;

            var currentSensorPositionDiv = $("<div/>").text("Current position: " + data.currentSensorPosition).appendTo(div);

            self.refresh = function (oldData, newData) {
                if (Math.abs(oldData.currentSensorPosition - newData.currentSensorPosition) > 15)
                    changeFunction(currentSensorPositionDiv, "Current position: ", oldData.currentSensorPosition, newData.currentSensorPosition);
            }
        },
        instance: null
    },
    tmm88d: {
        name: "TMM88D",
        artNo: "1094485",
        img: "IM0079631.png",
        build: function (div, data) {
            //id: "tmm88d"
            //inclinationX: -0.28
            //inclinationY: -0.09
            var self = this;

            var inclinationXDiv = $("<div/>").text("Inclination X: " + data.inclinationX).appendTo(div);
            var inclinationYDiv = $("<div/>").text("Inclination Y: " + data.inclinationY).appendTo(div);

            self.refresh = function (oldData, newData) {
                if (Math.abs(oldData.inclinationX - newData.inclinationX) > 0.10)
                    changeFunction(inclinationXDiv, "Inclination X: ", oldData.inclinationX, newData.inclinationX);
                if (Math.abs(oldData.inclinationY - newData.inclinationY) > 0.10)
                    changeFunction(inclinationYDiv, "Inclination Y: ", oldData.inclinationY, newData.inclinationY);
            }
        },
        instance: null
    },
    max48n: {
        name: "MAX48N",
        artNo: "1222079",
        img: "IM0079166.png",
        build: function (div, data) {
            //currentPostion: 300
            //id: "max48n"
            var self = this;

            var currentPostionDiv = $("<div/>").text("Current postion: " + data.currentPostion).appendTo(div);

            self.refresh = function (oldData, newData) {
                if (Math.abs(oldData.currentPostion - newData.currentPostion) > 5)
                    changeFunction(currentPostionDiv, "Current postion: ", oldData.currentPostion, newData.currentPostion);
            }
        },
        instance: null
    },
    imca00: {
        name: "IMC12",
        artNo: "1079286",
        img: "IM0059874.png",
        build: function (div, data) {
            //hasDetection: false
            //id: "imca00"
            //voltage: 0.072
            var self = this;

            var hasDetectionDiv = $("<div/>").text("Has detection: " + data.hasDetection).appendTo(div);
            var voltageDiv = $("<div/>").text("Output: " + data.voltage + " V").appendTo(div);

            self.refresh = function (oldData, newData) {
                if (Math.abs(oldData.voltage - newData.voltage) > 0.005) {
                    changeFunction(hasDetectionDiv, "Has detection: ", oldData.hasDetection, newData.hasDetection);
                    changeFunction(voltageDiv, "Output: ", oldData.voltage, newData.voltage, " V");
                }
            }
        },
        instance: null
    },
    pbt: {
        name: "PBT",
        artNo: "6041519",
        img: "IM0032017.png",
        build: function (div, data) {
            //currentMA: 4.052000045776367
            //id: "pbt"
            //pressureBar: 0.05200004577636719
            var self = this;

            var currentMADiv = $("<div/>").text("Current: " + data.currentMA.toFixed(2) + " mA").appendTo(div);
            var pressureBarDiv = $("<div/>").text("Pressure: " + data.pressureBar.toFixed(2) + " bar").appendTo(div);

            self.refresh = function (oldData, newData) {
                if (Math.abs(oldData.currentMA.toFixed(2) - newData.currentMA.toFixed(2)) > 0.03) {
                    changeFunction(currentMADiv, "Current: ", oldData.currentMA.toFixed(2), newData.currentMA.toFixed(2), " mA");
                    changeFunction(pressureBarDiv, "Pressure: ", oldData.pressureBar.toFixed(2), newData.pressureBar.toFixed(2), " bar");
                }
            }
        },
        instance: null
    },
    tdc: {
        name: "TDC-E200 EU",
        artNo: "6067898",
        img: "IM0078417.png",
        build: function (div, data) {
            var self = this;

            self.refresh = function (oldData, newData) {
                return;
            }
        },
        instance: null
    },
    visionaryB: {
        name: "Visionary-B",
        artNo: "8018626",
        img: "IM0075352.png",
        build: function (div, data) {
            var self = this;

            var visionaryBDiv = $("<div/>").text("Collision detected: " + data.colisionDetected).appendTo(div);
            
            self.refresh = function (oldData, newData) {
                changeFunction(visionaryBDiv, "Collision detected: ", oldData.colisionDetected, newData.colisionDetected);
            }

        },
        instance: null
    }
};


var changeFunction = function (elemenet, fixdText, oldValue, newValue, units) {
    if (units == undefined) units = "";

    if (oldValue != newValue) {
        elemenet.text(fixdText + newValue + units);
        elemenet.effect("highlight", {
            color: "#9c9c7e",
            queue: false
        }, 200);
    }
};

/*--------------------------- websocket controls ----------------------------*/
var webSocketConnection = (function () {
    var timer = null;
    var self = {
        webSocket: null
    };
    var options = {
        //url: "wss://echo.websocket.org/",
        //url: "ws://10.10.10.71:5000/ws/",
        url: "ws://" + window.location.host + "/ws/",
        allwaysAlive: true,
        attempt: 0,
        attemptLimit: 10
    };

    var connect = function () {
        if (self.webSocket != null) {
            self.webSocket.close();
        }
        self.webSocket = createWs();
    };

    var createWs = function () {
        var fullUrl = options.url;
        console.log("[WS] Initializing socket on url=" + fullUrl);

        var webSocket = new WebSocket(fullUrl);

        webSocket.onopen = function (e) {
            console.log("[WS] socket opened", e);

            options.attempt = 0;

            if ($(window).height() > 870 && $(window).width() > 1030) {
                $("#mineTruck").popover('show');
                $("#bagger").popover('show');
                $("#driller").popover('show');
                $("#wheelLoaders").popover('show');
                $("#roller").popover('show');
            }
            
        };

        webSocket.onerror = function (e) {
            console.log("[WS] socket error", e);
        };

        webSocket.onmessage = function (msg) {

            var msgData = msg.data;

            try {
                var data = JSON.parse(msgData);

                switch (data.msgType) {
                    case "alarm":
                        var alarm = {
                            alarmActive: data.isActive,
                            text: data.value
                        };

                        if (Vehicles[data.obj].alarms.filter(e => e.text === alarm.text).length == 0 && alarm.alarmActive == true) {
                            infoWindowBulder.addAlarm(data.obj, alarm);
                        }

                        if (Vehicles[data.obj].alarms.filter(e => e.text === alarm.text).length > 0 && alarm.alarmActive == false) {
                            infoWindowBulder.removeAlarm(data.obj, alarm);
                        }

                        break;
                    case "data":

                        data.data = JSON.parse(data.value);

                        var changes = {
                            fuelLevel: false,
                            isIdle: false,
                            isWorking: false,
                            specialTask: false,
                            dailyWorkTime: false,
                            totalAlarmCount: false
                        };

                        if (Vehicles[data.obj].fuelLevel != (data.data.fuelLevel * 100).toFixed(0)) {
                            changes.fuelLevel = true;
                            Vehicles[data.obj].fuelLevel = (data.data.fuelLevel * 100).toFixed(0);
                        }

                        if (Vehicles[data.obj].isIdle != data.data.isIdle) {
                            changes.isIdle = true;
                            Vehicles[data.obj].isIdle = data.data.isIdle;
                        }

                        if (Vehicles[data.obj].isWorking != data.data.isWorking) {
                            changes.isWorking = true;
                            Vehicles[data.obj].isWorking = data.data.isWorking;
                        }

                        if (data.data.specialTask != null && Vehicles[data.obj].specialTask != data.data.specialTask) {
                            changes.specialTask = true;
                            Vehicles[data.obj].specialTask = data.data.specialTask;
                        }

                        if (Vehicles[data.obj].dailyWorkTime != data.data.workingTimeString) {
                            changes.dailyWorkTime = true;
                            Vehicles[data.obj].dailyWorkTime = data.data.workingTimeString;
                        }

                        if (Vehicles[data.obj].totalAlarmCount != data.data.totalAlarmCount) {
                            changes.totalAlarmCount = true;
                            Vehicles[data.obj].totalAlarmCount = data.data.totalAlarmCount;
                        }

                        if (Vehicles[data.obj].timeSinceLastAlarm != data.data.timeSinceLastAlarm) {
                            changes.timeSinceLastAlarm = true;
                            Vehicles[data.obj].timeSinceLastAlarm = data.data.timeSinceLastAlarm;
                        }
                        
                        
                        
                        //Vehicles[data.obj].sensors = data.data.sensors;
                        if (Vehicles[data.obj].isSelected) {
                            detailView.refresh(Vehicles[data.obj], data.data.sensors);

                            if (data.obj == "bagger") {
                                Vehicles[data.obj].detailViewInstance.refresh(data.data.armPosition);
                            } else if (data.obj == "mineTruck") {
                                Vehicles[data.obj].detailViewInstance.refresh(data.data.trailerPosition);
                            } else if (data.obj == "driller") {
                                Vehicles[data.obj].detailViewInstance.refresh(data.data.rigPosition);
                            } else if (data.obj == "wheelLoaders") {
                                Vehicles[data.obj].detailViewInstance.refresh(data.data.bucketPosition);
                            } else if (data.obj == "roller") {
                                //console.log(data.data);
                                //Vehicles[data.obj].detailViewInstance.refresh(data.data.bucketPosition);
                            }
                        }

                        if (changes.fuelLevel || changes.isIdle || changes.isWorking || changes.specialTask || changes.dailyWorkTime) {
                            infoWindowBulder.refresh(Vehicles[data.obj], changes);

                            if (Vehicles[data.obj].isSelected) {
                                detailView.refreshHeader(Vehicles[data.obj], changes);
                            }
                        }

                        break;
                    case "sensor":
                        //console.log(data);
                        break;
                }


            } catch (exe) {
                console.log(exe);
            }

        };

        webSocket.onclose = function (e) {
            console.log("[WS] socket closed alwaysAlive=" + options.allwaysAlive, e);

            if (timer != null) {
                clearTimeout(timer);
                console.log("[WS] Cleared old timer...");
            }

            if (options.allwaysAlive && options.attemptLimit > options.attempt) {
                timer = setTimeout(
                    function () {
                        console.log("[WS] Try to reinitialize websocket...");
                        try {
                            if (self.webSocket != null) {
                                self.webSocket.close();
                                self.webSocket = null;
                            }
                        } catch (e) {
                            //Swallow this error
                        }
                        options.attempt++;
                        self.webSocket = createWs();
                    }, 10000
                );
            }
        };

        return webSocket;
    };

    var send = function (msg) {
        self.webSocket.send(msg);
    };

    return {
        connect: connect,
        send: send,
        webSocket: self.webSocket
    }
})();