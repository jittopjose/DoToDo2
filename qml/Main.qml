/*
 * Copyright (C) 2026  Jitto
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; version 3.
 *
 * dotodo2 is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import QtQuick 2.7
import Lomiri.Components 1.3
import QtQuick.Layouts 1.3
import QtWebEngine 1.7
import QtWebChannel 1.0

MainView {
    id: root
    objectName: "mainView"
    applicationName: "dotodo2.jitto"
    automaticOrientation: true
    width: units.gu(45)
    height: units.gu(75)

    QtObject {
        id: backend
        WebChannel.id: "backend"

        function log(msg) {
            console.log("React says:", msg)
        }
    }

    WebChannel {
        id: channel
        registeredObjects: [ backend ]
    }

    WebEngineView {
        anchors.fill: parent
        url: "qrc:/web/index.html"  // or a remote URL
        webChannel: channel
        zoomFactor: 0.9
    }
}

