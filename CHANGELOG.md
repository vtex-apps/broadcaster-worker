# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.5.2] - 2021-06-22
### Added
- `filterStock` middleware to filter events without `HasStockKeepingUnitModified` property

## [0.5.1] - 2021-06-07
### Added
- Improved concurrency handling of `indexRoutes` events.
- Add settings middleware to the indexRoutes event too.
- Log debug info when indexing is disabled.

### Fixed
- Only increment throttle counter when we do process the event.

## [0.5.0] - 2021-06-01

## [0.4.3] - 2021-02-11
### Fixed
- Forwards 429 error

## [0.4.2] - 2020-11-24

- Add policy for `index-routes` resource

## [0.4.1] - 2020-07-16

### Fixed

- Uses apps token for catalog api authorization

## [0.4.0] - 2020-05-06

## [0.3.4] - 2020-04-27

## [0.3.3] - 2020-04-24

### Fixed

- Correctly end while loop

## [0.3.2] - 2020-04-16

### Fixed

- Increased sleep time due to 5 requests per minute limit

## [0.3.1] - 2020-04-13

### Changed

- Replaces parentName to parent and add category id to event since we need this to translate routes

## [0.3.0] - 2020-04-13

### Feature

- Goes up the category tree and send an event for each parent category

## [0.2.0] - 2020-04-03

### Feature

- Removes always notify setting
- Validate indexation requests

## [0.1.2] - 2020-04-01

### Fixed

- Decreases MAX # REQUESTS
- Decreases number of workers
- Decreases number of products in one request
- Decreases max Replicas
- Returns 429 after waiting a random amount of time

## [0.1.1] - 2020-03-26

### Fixed

- Decreases number of maximun simultaneous requests
- Slower indexing of products

## [0.1.0] - 2020-03-25

### Added

- New route to index store products

## [0.0.3] - 2020-03-24

### Fixed

- Decreases max requests param

## [0.0.2] - 2020-03-18

### Fixed

- Event sender updated

## [0.0.1] - 2020-03-11
