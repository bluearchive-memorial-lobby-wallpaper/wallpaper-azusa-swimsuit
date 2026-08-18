# Creating a Project

New projects are created by the central Pipeline from the managed Template. A project repository must not install Toolkit or provide lifecycle npm scripts.

Project creation supplies:

- Stable student, variant, project, and repository identity.
- `wallpaper.manifest.json` with resource and distribution requirements.
- Character configuration and content placeholders.
- Runtime application dependency.
- Provenance, metadata, and licensing documents.

After creation, Pipeline acquires and prepares resources, builds the candidate, performs browser and Wallpaper Engine acceptance, packages the verified distribution, and updates the Registry.
