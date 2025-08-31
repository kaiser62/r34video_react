export interface Video {
  id: string;
  title: string;
  thumbnailUrl: string;
  tags: string[];
}

export const videos: Video[] = [
  {
    id: "1",
    title: "Sample Video 1",
    thumbnailUrl: "https://via.placeholder.com/320x180.png?text=Video+1",
    tags: ["tag1", "tag2", "tag3"],
  },
  {
    id: "2",
    title: "Sample Video 2",
    thumbnailUrl: "https://via.placeholder.com/320x180.png?text=Video+2",
    tags: ["tag4", "tag5", "tag6"],
  },
  {
    id: "3",
    title: "Sample Video 3",
    thumbnailUrl: "https://via.placeholder.com/320x180.png?text=Video+3",
    tags: ["tag1", "tag5", "tag7"],
  },
  {
    id: "4",
    title: "Sample Video 4",
    thumbnailUrl: "https://via.placeholder.com/320x180.png?text=Video+4",
    tags: ["tag2", "tag4", "tag8"],
  },
  {
    id: "5",
    title: "Sample Video 5",
    thumbnailUrl: "https://via.placeholder.com/320x180.png?text=Video+5",
    tags: ["tag3", "tag6", "tag9"],
  },
];
