import pytest

from apps.chat.services import moderation


@pytest.fixture(autouse=True)
def _moderation_passes(request, mocker):
    """Default the on-topic/crisis classifier to a pass for every chat test —
    without this, its call would silently consume the first item of any
    mocked groq_client.create_completion side_effect queue (e.g. the
    tool-calling round-trip test), desyncing the mocked responses from the
    calls that actually exercise them. Tests that specifically want to
    exercise the classifier re-patch this within the test body, which applies
    on top of this fixture.

    test_moderation.py tests classify_message() itself, so it opts out —
    patching it there would just mask the real function under test."""
    if request.node.fspath.basename == "test_moderation.py":
        return
    mocker.patch.object(
        moderation,
        "classify_message",
        return_value=moderation.ModerationResult(on_topic=True, crisis=False, lang="en"),
    )
