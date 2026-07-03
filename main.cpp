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

#include <QGuiApplication>
#include <QCoreApplication>
#include <QUrl>
#include <QString>
#include <QQuickView>
#include <QQmlContext>
#include <QScreen>
#include <QtWebEngine>

int main(int argc, char *argv[])
{
    QtWebEngine::initialize();

    QGuiApplication *app = new QGuiApplication(argc, (char**)argv);
    app->setApplicationName("dotodo2.jitto");

    qreal dpr = QGuiApplication::primaryScreen()->devicePixelRatio();

    qDebug() << "Starting app from main.cpp (DPR:" << dpr << ")";

    QQuickView *view = new QQuickView();
    view->rootContext()->setContextProperty("dpRatio", dpr);
    view->setSource(QUrl("qrc:/qml/Main.qml"));
    view->setResizeMode(QQuickView::SizeRootObjectToView);
    view->show();

    return app->exec();
}
