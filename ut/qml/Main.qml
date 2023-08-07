/*
 * Copyright (C) 2023  Jitto P Jose
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
import QtQuick.Controls 2.2
import Lomiri.Components 1.3
import QtQuick.Layouts 1.3
import Qt.labs.settings 1.0
import QtWebEngine 1.7
import QtWebChannel 1.0

//import Greeter 1.0

ApplicationWindow {
    id: root
    objectName: 'mainView'

    width: units.gu(45)
    height: units.gu(75)
    visible: true

    // Greeter {
    //     id: greeter
    //     name: "Rust + Ubuntu Touch"
    // }

    QtObject {
        id: someObject

        WebChannel.id: "backend"

        property string someProperty: "Text comming form QML"
    }

    Page {
        anchors.fill: parent
        header: PageHeader {
            id: header
            title: i18n.tr('Do To Do 2')
            visible: false
        }

        WebEngineView {
            id: _webview
            // profile: WebEngineProfile{ 
            //     id: dotodo2
            //     httpUserAgent: "Mozilla/5.0 (Linux; Android 7.0; SM-G930V Build/NRD90M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.125 Mobile Safari/537.36"
            // }
            url: "http://localhost:3031/"
            anchors.fill: parent
            webChannel: channel
        }

        WebChannel {
            id: channel
            registeredObjects: [someObject]
        }
    }
}
