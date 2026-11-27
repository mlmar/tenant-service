SHELL := /bin/bash
.DEFAULT_GOAL := help

.PHONY: icons
icons:
	npm --workspace frontend run icons

EAS ?= eas
PLATFORM ?= all
PROFILE ?= preview
IOS_SIM_PORT ?= 8082
IOS_SIM_BUNDLE_ID ?= $(shell node -p 'require("./brand.json").bundleIdentifier')
MESSAGE ?=
export MESSAGE EAS

.PHONY: help install setup dev dev-down dev-logs dev-app dev-app-down dev-web dev-api test typecheck build check eas-login eas-whoami eas-init eas-check eas-build ios-build android-build android-build-preview ios-submit android-submit ios-testflight android-release android-credentials android-check android-export ios-sim-fresh ios-sim-build ios-sim-reload ota-env ota-all ota-ios ota-android eas-update eas-update-all eas-update-ios eas-update-android eas-env-production eas-build-ios eas-build-android eas-build-android-preview eas-submit-ios eas-submit-android testflight app app-down
help:
	@node scripts/workflow.mjs help
install:
	npm ci
setup:
	@node scripts/workflow.mjs setup
dev:
	docker compose up --build --watch backend frontend
dev-down:
	docker compose down
dev-logs:
	docker compose logs --follow backend frontend
dev-app:
	docker compose --profile combined up --build app
dev-app-down:
	docker compose --profile combined stop app
dev-web:
	npm run dev:web
dev-api:
	npm run dev:api
test:
	npm test
typecheck:
	npm run typecheck
build:
	npm run build
check: typecheck test

eas-login:
	$(EAS) login
eas-whoami:
	$(EAS) whoami
eas-init:
	cd frontend && $(EAS) init
eas-check:
	@node scripts/workflow.mjs eas-check $(PROFILE)
eas-build:
	@node scripts/workflow.mjs build $(PROFILE) $(PLATFORM)
ios-build:
	@node scripts/workflow.mjs build production ios
android-build:
	@node scripts/workflow.mjs build production android
android-build-preview:
	@node scripts/workflow.mjs build preview android
ios-submit:
	@node scripts/workflow.mjs submit production ios
android-submit:
	@node scripts/workflow.mjs submit production android
ios-testflight:
	$(MAKE) ios-build
	$(MAKE) ios-submit
android-release:
	$(MAKE) android-build
	$(MAKE) android-submit
android-credentials:
	@node scripts/workflow.mjs credentials production android
android-check:
	@node scripts/workflow.mjs eas-check $(PROFILE)
	npm --workspace frontend run typecheck
android-export:
	cd frontend && npx expo export --platform android --output-dir dist-android-check
ios-sim-fresh:
	cd frontend && npx expo start --dev-client --clear --port $(IOS_SIM_PORT)
ios-sim-build:
	cd frontend && npx expo run:ios --port $(IOS_SIM_PORT)
ios-sim-reload:
	xcrun simctl launch --terminate-running-process booted $(IOS_SIM_BUNDLE_ID)
ota-env:
	@node scripts/workflow.mjs env-push production
ota-all:
	@node scripts/workflow.mjs update production all
ota-ios:
	@node scripts/workflow.mjs update production ios
ota-android:
	@node scripts/workflow.mjs update production android

# Alias targets.
app: dev-app
app-down: dev-app-down
eas-env-production: ota-env
eas-update: ota-all
eas-update-all: ota-all
eas-update-ios: ota-ios
eas-update-android: ota-android
eas-build-ios: ios-build
eas-submit-ios: ios-submit
testflight: ios-testflight
eas-build-android-preview: android-build-preview
eas-build-android: android-build
eas-submit-android: android-submit


