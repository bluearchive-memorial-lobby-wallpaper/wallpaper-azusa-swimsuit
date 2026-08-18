# Upgrading

Runtime upgrades and project maintenance are initiated as Pipeline business modes. The immutable Plan pins the Pipeline, Toolkit, build tool, transformer, schema, and acceptance-policy versions used for every target in the batch.

Wallpaper repositories declare only their Runtime dependency and project Manifest. They do not select the Toolkit executor and do not run repository-local build, validation, or packaging scripts.

An upgrade is accepted only after the Pipeline completes its configured build, browser, Wallpaper Engine, distribution, and package gates and reconciles the result into the Registry.
