import { HowTo, Media, Step, OSFamily } from "../types/content";

type InvalidResult = {
  valid: false;
  errors: string[];
};

type ValidResult = {
  valid: true;
  value: HowTo;
};

export type ValidationResult = ValidResult | InvalidResult;

const OS_FAMILIES: ReadonlyArray<OSFamily> = ["ios", "ipados", "android", "windows", "macos"];

const MEDIA_TYPES: ReadonlyArray<Media["type"]> = ["image", "audio", "video"];

export function validateHowTo(candidate: unknown): ValidationResult {
  const errors: string[] = [];

  if (!candidate || typeof candidate !== "object") {
    return { valid: false, errors: ["HowTo muss ein Objekt sein."] };
  }

  const record = candidate as Record<string, unknown>;

  const id = getString(record.id);
  const slug = getString(record.slug);
  const os = record.os;
  const osVersion = record.osVersion;
  const title = getString(record.title);
  const summary = getString(record.summary);
  const keywords = record.keywords;
  const estimatedMinutes = record.estimatedMinutes;
  const steps = record.steps;

  if (!id) errors.push("Feld 'id' fehlt oder ist leer.");
  if (!slug) errors.push("Feld 'slug' fehlt oder ist leer.");

  if (!OS_FAMILIES.includes(os as OSFamily)) {
    errors.push(`Feld 'os' muss eines von ${OS_FAMILIES.join(", ")} sein.`);
  }

  if (!osVersion || typeof osVersion !== "object") {
    errors.push("Feld 'osVersion' fehlt oder ist kein Objekt.");
  } else {
    const ov = osVersion as Record<string, unknown>;
    if (!getString(ov.min)) {
      errors.push("Feld 'osVersion.min' fehlt oder ist leer.");
    }
    if (ov.max !== undefined && !getString(ov.max)) {
      errors.push("Feld 'osVersion.max' muss eine nicht-leere Zeichenkette sein, falls gesetzt.");
    }
  }

  if (!title) errors.push("Feld 'title' fehlt oder ist leer.");
  if (!summary) errors.push("Feld 'summary' fehlt oder ist leer.");

  if (!Array.isArray(keywords) || keywords.length === 0 || keywords.some((item) => typeof item !== "string" || !item.trim())) {
    errors.push("Feld 'keywords' muss ein Array aus nicht-leeren Zeichenketten sein.");
  }

  if (typeof estimatedMinutes !== "number" || Number.isNaN(estimatedMinutes) || estimatedMinutes <= 0) {
    errors.push("Feld 'estimatedMinutes' muss eine positive Zahl sein.");
  }

  if (!Array.isArray(steps) || steps.length === 0) {
    errors.push("Feld 'steps' muss ein Array mit mindestens einem Eintrag sein.");
  }

  const parsedSteps: Step[] = [];

  if (Array.isArray(steps)) {
    steps.forEach((step, index) => {
      const parsed = validateStep(step, index);
      if ("error" in parsed) {
        errors.push(...parsed.error);
      } else {
        parsedSteps.push(parsed.step);
      }
    });
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  const value: HowTo = {
    id: id!,
    slug: slug!,
    os: os as OSFamily,
    osVersion: osVersion as HowTo["osVersion"],
    title: title!,
    summary: summary!,
    keywords: keywords as string[],
    estimatedMinutes,
    steps: parsedSteps,
  };

  if (record.prerequisites) {
    if (!Array.isArray(record.prerequisites) || record.prerequisites.some((item) => typeof item !== "string" || !item.trim())) {
      errors.push("Feld 'prerequisites' muss aus nicht-leeren Zeichenketten bestehen.");
    } else {
      value.prerequisites = record.prerequisites as string[];
    }
  }

  if (record.resources) {
    if (!Array.isArray(record.resources)) {
      errors.push("Feld 'resources' muss ein Array sein.");
    } else {
      const resources = [];
      for (const resource of record.resources) {
        if (!resource || typeof resource !== "object") {
          errors.push("Alle Ressourcen müssen Objekte sein.");
          continue;
        }
        const res = resource as Record<string, unknown>;
        const label = getString(res.label);
        const href = getString(res.href);
        if (!label || !href) {
          errors.push("Ressourcen benötigen 'label' und 'href'.");
          continue;
        }
        resources.push({ label, href });
      }

      if (resources.length > 0) {
        value.resources = resources;
      }
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return { valid: true, value };
}

type StepValidation =
  | {
      step: Step;
    }
  | {
      error: string[];
    };

function validateStep(candidate: unknown, index: number): StepValidation {
  const errors: string[] = [];
  if (!candidate || typeof candidate !== "object") {
    return { error: [`Schritt ${index + 1} ist kein Objekt.`] };
  }

  const record = candidate as Record<string, unknown>;

  const id = getString(record.id) ?? `step-${index + 1}`;
  const order = typeof record.order === "number" ? record.order : index + 1;
  const title = getString(record.title);
  const description = getString(record.description);
  const tips = record.tips;
  const media = record.media;

  if (!title) errors.push(`Schritt ${index + 1}: 'title' fehlt oder ist leer.`);
  if (!description) errors.push(`Schritt ${index + 1}: 'description' fehlt oder ist leer.`);

  const parsedMedia: Media[] = [];
  if (media !== undefined) {
    if (!Array.isArray(media)) {
      errors.push(`Schritt ${index + 1}: 'media' muss ein Array sein.`);
    } else {
      media.forEach((item, mediaIndex) => {
        const parsed = validateMedia(item, index, mediaIndex);
        if ("error" in parsed) {
          errors.push(...parsed.error);
        } else {
          parsedMedia.push(parsed.media);
        }
      });
    }
  }

  let parsedTips: string[] | undefined;
  if (tips !== undefined) {
    if (!Array.isArray(tips) || tips.some((tip) => typeof tip !== "string" || !tip.trim())) {
      errors.push(`Schritt ${index + 1}: 'tips' muss ein Array nicht-leerer Zeichenketten sein.`);
    } else {
      parsedTips = tips as string[];
    }
  }

  if (errors.length > 0) {
    return { error: errors };
  }

  return {
    step: {
      id,
      order,
      title: title!,
      description: description!,
      media: parsedMedia.length > 0 ? parsedMedia : undefined,
      tips: parsedTips,
    },
  };
}

type MediaValidation =
  | { media: Media }
  | { error: string[] };

function validateMedia(candidate: unknown, stepIndex: number, mediaIndex: number): MediaValidation {
  const errors: string[] = [];

  if (!candidate || typeof candidate !== "object") {
    return { error: [`Schritt ${stepIndex + 1}, Medium ${mediaIndex + 1}: kein Objekt.`] };
  }

  const record = candidate as Record<string, unknown>;
  const type = record.type;
  const id = getString(record.id) ?? `s${stepIndex + 1}-media-${mediaIndex + 1}`;
  const alt = getString(record.alt);

  if (!MEDIA_TYPES.includes(type as Media["type"])) {
    errors.push(`Schritt ${stepIndex + 1}, Medium ${mediaIndex + 1}: Unbekannter Typ '${String(type)}'.`);
  }

  if (!alt) {
    errors.push(`Schritt ${stepIndex + 1}, Medium ${mediaIndex + 1}: 'alt' fehlt oder ist leer.`);
  }

  if (errors.length > 0) {
    return { error: errors };
  }

  switch (type) {
    case "image": {
      const src = getString(record.src);
      if (!src) {
        errors.push(`Schritt ${stepIndex + 1}, Bild ${mediaIndex + 1}: 'src' fehlt oder ist leer.`);
        return { error: errors };
      }
      return {
        media: {
          type: "image",
          id,
          src,
          alt: alt!,
          description: getString(record.description) ?? undefined,
          width: typeof record.width === "number" ? record.width : undefined,
          height: typeof record.height === "number" ? record.height : undefined,
        },
      };
    }
    case "audio": {
      const src = getString(record.src);
      if (!src) {
        errors.push(`Schritt ${stepIndex + 1}, Audio ${mediaIndex + 1}: 'src' fehlt oder ist leer.`);
        return { error: errors };
      }
      return {
        media: {
          type: "audio",
          id,
          src,
          alt: alt!,
          description: getString(record.description) ?? undefined,
          transcript: getString(record.transcript) ?? undefined,
        },
      };
    }
    case "video": {
      const src = getString(record.src);
      if (!src) {
        errors.push(`Schritt ${stepIndex + 1}, Video ${mediaIndex + 1}: 'src' fehlt oder ist leer.`);
        return { error: errors };
      }
      return {
        media: {
          type: "video",
          id,
          src,
          alt: alt!,
          description: getString(record.description) ?? undefined,
          poster: getString(record.poster) ?? undefined,
          captions: getString(record.captions) ?? undefined,
        },
      };
    }
    default: {
      errors.push(`Schritt ${stepIndex + 1}, Medium ${mediaIndex + 1}: Unbekannter Medientyp.`);
      return { error: errors };
    }
  }
}

export function validateHowToList(candidates: unknown[]): InvalidResult | { valid: true; values: HowTo[] } {
  const aggregatedErrors: string[] = [];
  const validValues: HowTo[] = [];

  candidates.forEach((candidate, index) => {
    const result = validateHowTo(candidate);
    if (!result.valid) {
      aggregatedErrors.push(...result.errors.map((error) => `Eintrag ${index + 1}: ${error}`));
    } else {
      validValues.push(result.value);
    }
  });

  if (aggregatedErrors.length > 0) {
    return { valid: false, errors: aggregatedErrors };
  }

  return { valid: true, values: validValues };
}

function getString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}
