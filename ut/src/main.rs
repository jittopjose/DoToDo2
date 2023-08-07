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


use std::process::Command;
use std::process::Stdio;

#[tokio::main]
async fn main() {
    tokio::spawn(async {
        let route = warp::fs::dir("./web");
        warp::serve(route).run(([127, 0, 0, 1], 3031)).await;
    });
    Command::new("qmlscene")
        .arg("--scaling")
        .arg("--webEngineArgs ")
        .arg("--remote-debugging-port")
        .arg("qml/Main.qml")
        .stdout(Stdio::piped())
        .spawn()
        .expect("GUI failed to start")
        .wait()
        .unwrap();

}

