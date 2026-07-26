from django.core.management.base import BaseCommand
from django.utils.text import slugify

from apps.quotes.models import Category, Quote

from apps.courses.models import Course, CourseStage

# Deterministic placeholder cover photos (picsum always returns an image for a
# given seed). Real covers get pasted in via the admin URL field later.
def _cover(slug):
    return f"https://picsum.photos/seed/{slug}/900/560"


COURSES = [
    {
        "title": "Building Confidence",
        "teaser": "Grow steady self-assurance from the inside out.",
        "description": (
            "A short path to a quieter, sturdier sense of self. Each stage pairs a psychological "
            "idea with a reflection you can sit with — no pep talk, no pretending, just steady "
            "practice in trusting your own footing."
        ),
        "categories": ["Self-Knowledge"],
        "stages": [
            ("What confidence actually is", "Confidence isn't the absence of doubt — it's a willingness to act alongside it."),
            ("Naming the inner critic", "The critical voice feels like truth. Naming it turns it back into just a voice."),
            ("Evidence over feeling", "Feelings aren't facts. Look for what you've actually done, not only what you fear."),
            ("Small brave actions", "Confidence is built, not summoned — one slightly-uncomfortable action at a time."),
            ("Standing in your worth", "Your worth isn't a performance review. It doesn't rise and fall with the day."),
        ],
    },
    {
        "title": "Riding Stress",
        "teaser": "Meet pressure with a calmer nervous system.",
        "description": (
            "Stress is not the enemy — the goal is a wider window for it. This course walks through "
            "how the body reacts under load and simple ways to settle it, drawing on ideas from "
            "mindfulness and emotion research."
        ),
        "categories": ["Emotional Intelligence", "Mindfulness"],
        "stages": [
            ("Your stress response", "Stress is a body-first event. Understanding it is the first way to soften it."),
            ("The breath as an anchor", "The one lever always available: a slow exhale tells the body it is safe."),
            ("Reading early signals", "Tension whispers before it shouts. Catch it early and it costs less."),
            ("Letting a wave pass", "Emotions crest and fall. You can ride one without being swept away."),
            ("Recovery, not avoidance", "The aim isn't a stress-free life — it's returning to baseline more easily."),
            ("A calmer baseline", "Small daily practices slowly lower the water line you live at."),
        ],
    },
    {
        "title": "Healthy Boundaries",
        "teaser": "Say no without guilt, protect your energy.",
        "description": (
            "Boundaries are how we stay close to people without losing ourselves. Learn to notice "
            "where yours are, voice them plainly, and hold them with warmth rather than walls."
        ),
        "categories": ["Boundaries"],
        "stages": [
            ("Where you end", "A boundary starts with noticing what is and isn't yours to carry."),
            ("The cost of over-giving", "Chronic self-abandonment has a bill, and resentment is how it's paid."),
            ("Saying it kindly", "A boundary can be clear and warm at once. It's information, not an attack."),
            ("Holding the line", "The hard part isn't setting a boundary — it's keeping it when it's tested."),
        ],
    },
    {
        "title": "Everyday Mindfulness",
        "teaser": "Bring gentle attention to ordinary moments.",
        "description": (
            "Not an app streak, not emptying your mind — just returning, again and again, to what "
            "is here. A week of small invitations to notice, from the first sip of coffee to the "
            "walk home."
        ),
        "categories": ["Mindfulness"],
        "stages": [
            ("Arriving", "Before doing, just arrive. One conscious breath is enough to begin."),
            ("One breath", "You don't need ten minutes. One fully-felt breath already counts."),
            ("Eating slowly", "A single mindful bite can wake up a whole meal."),
            ("Walking", "Feel the ground. Walking is meditation that happens to move you somewhere."),
            ("Sounds around you", "Let sound arrive without naming it. Just listening, nothing to fix."),
            ("The body scan", "Attention travels the body like slow light, softening what it touches."),
            ("Letting go lightly", "Thoughts will come. The practice is simply returning, without judgement."),
        ],
    },
]

# Best-effort: attach an existing seeded quote to a stage where it fits, keyed by
# stage title. Skipped silently if the quote isn't in the DB.
STAGE_QUOTES = {
    "A calmer baseline": "You can't stop the waves, but you can learn to surf.",
    "Holding the line": "Daring to set boundaries is about having the courage to love ourselves even when we risk disappointing others.",
    "Letting go lightly": "Feelings come and go like clouds in a windy sky. Conscious breathing is my anchor.",
    "Standing in your worth": "The privilege of a lifetime is to become who you truly are.",
}


class Command(BaseCommand):
    help = "Seed a starter set of published psychology micro-courses with stages."

    def handle(self, *args, **options):
        created_courses = 0
        created_stages = 0

        for item in COURSES:
            slug = slugify(item["title"])
            course, created = Course.objects.get_or_create(
                slug=slug,
                defaults={
                    "title": item["title"],
                    "teaser": item["teaser"],
                    "description": item["description"],
                    "cover_image": _cover(slug),
                    "is_published": True,
                },
            )
            if created:
                created_courses += 1

            category_objs = list(Category.objects.filter(name__in=item["categories"]))
            if category_objs:
                course.categories.set(category_objs)

            for index, (title, body) in enumerate(item["stages"], start=1):
                reflection = f"Take a moment: how does “{title.lower()}” show up in your own life right now?"
                stage, s_created = CourseStage.objects.get_or_create(
                    course=course,
                    stage_number=index,
                    defaults={"title": title, "body": body, "reflection_prompt": reflection},
                )
                if s_created:
                    created_stages += 1
                quote_text = STAGE_QUOTES.get(title)
                if quote_text and stage.quote_id is None:
                    quote = Quote.objects.filter(text=quote_text).first()
                    if quote:
                        stage.quote = quote
                        stage.save(update_fields=["quote"])

        self.stdout.write(
            self.style.SUCCESS(
                f"Seeded courses: {created_courses} created "
                f"({len(COURSES) - created_courses} already existed), "
                f"{created_stages} stages created. Books can be linked per stage via admin."
            )
        )
