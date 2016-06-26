#!/usr/bin/env python

from gi.repository import (
  GObject,
  Gtk,
  WebKit,
)

import cairo

class Uri2Png(object):
    def __init__(self, uri, filepath, width=1280, height=1024, delay=250, user_agent=None):
        self.uri = uri
        self.filepath = filepath
        self.width = width
        self.height = height
        self.delay = delay
        self.user_agent = user_agent

    def capture(self):
        window = Gtk.OffscreenWindow.new()
        webview = WebKit.WebView.new()

        # make webkit settings object.
        webkit_settings = webview.get_settings()
        # enable plugins.
        webkit_settings.set_property('enable-plugins', True)
        # set user-agent if given.
        if self.user_agent != None:
            webkit_settings.set_property('user-agent', self.user_agent)
        # attach settings to webview.
        webview.set_settings(webkit_settings)

        webview.load_uri(self.uri)
        webview.set_size_request(self.width, self.height)
        window.add(webview)

        webview.connect_after('notify::load-status', self.on_load_status_changed, window)

        window.show_all()
        Gtk.main()

    def write_to_png(self, window):
        """old gi repo"""
        allocation = window.get_allocation()

        surface = cairo.ImageSurface(cairo.FORMAT_ARGB32, allocation.width, allocation.height)
        cr = cairo.Context(surface)
        window.draw(cr)
        surface.write_to_png(self.filepath)
        Gtk.main_quit()

    def write_to_png2(self, webview):
        """new gi repo"""
        webview.get_snapshot().write_to_png(self.filepath)
        Gtk.main_quit()

    def on_load_status_changed(self, webview, pspec, window):
        if webview.props.load_status == WebKit.LoadStatus.FINISHED:
            # Add delay after DOM Loaded Event.
            GObject.timeout_add(self.delay, self.write_to_png, window)

    def on_load_status_changed2(self, webview, pspec, window):
        if webview.props.load_status == WebKit.LoadStatus.FINISHED:
            # Add delay after DOM Loaded Event.
            GObject.timeout_add(self.delay, self.write_to_png2, webview)


