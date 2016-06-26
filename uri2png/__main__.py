#!/usr/bin/env python
from .uri2png import Uri2Png

from argparse import ArgumentParser

def main():
    parser = ArgumentParser(description="uri2png | webpage screenshot")
    parser.add_argument('uri', help='target uri to screenshot')
    parser.add_argument('filepath', help='filename or filepath')
    parser.add_argument("-v", "--viewport", type=int, default=1280,
                      help="viewport width resolution of browser in pixels")
    parser.add_argument("-d", "--delay", type=int, default=1000,
                      help="milliseconds to wait after DOM Loaded event")
    parser.add_argument("-u", "--user-agent", default=None,
                      help="Set the browser user-agent")
    args = parser.parse_args()
    args.width, args.height = args.viewport, args.viewport
    del args.viewport
    Uri2Png(**args.__dict__).capture()

if __name__ == '__main__':
    main()
