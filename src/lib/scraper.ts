export const joinRichText = (richTextArray: any[], useWrappers = false) => {
  return useWrappers
    ? richTextArray
        .map((entity) => {
          let content = entity.text.content;

          // Apply formatting based on annotations
          if (entity.annotations.bold) {
            content = `**${content}**`;
          }
          if (entity.annotations.italic) {
            content = `*${content}*`;
          }
          if (entity.annotations.strikethrough) {
            content = `~~${content}~~`;
          }
          if (entity.annotations.underline) {
            content = `<u>${content}</u>`;
          }
          if (entity.annotations.code) {
            content = `\`${content}\``;
          }
          if (entity.text.link) {
            content = `[${content}](${entity.text.link})`;
          }

          return content;
        })
        .join("")
    : richTextArray.map((entity) => entity.plain_text).join("");
};

export const eternifyFile = async (url) => {
  const res = await fetch(
    `https://filepod.keepish.net?url=${encodeURIComponent(url)}`,
    {
      method: "GET",
    },
  ).then((r) => r.json());
  return res.id;
};

export const sanitizeEntry = async ({ id, ...entry }) => {
  const sanitized = {
    id,
  };
  for (const [field, value] of Object.entries(entry)) {
    sanitized[field] = value.type ? value[value.type] : value;
    if (["title", "rich_text"].includes(value.type)) {
      sanitized[field] = {
        rich: joinRichText(sanitized[field], true),
        plain: joinRichText(sanitized[field]),
      };
    }
    if (Array.isArray(sanitized[field])) {
      for (let i = 0; i < sanitized[field].length; i++) {
        if (sanitized[field][i].type === "file") {
          const newUrlRes = await eternifyFile(sanitized[field][i].file.url);
          sanitized[field][i].file.url =
            `https://filepod.keepish.net/${newUrlRes}`;
        }
      }
    }
  }
  return sanitized;
};
