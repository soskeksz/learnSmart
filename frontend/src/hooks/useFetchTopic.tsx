import {useEffect, useState} from "react";
import {Topic} from "../components/TopicForm.tsx";
import {getTopicById} from "../providers/topicProvider.ts";
import {Variant} from "../context/alertContext/FeedbackContext.tsx";

const useFetchTopic = (id: string | undefined, navigate: (path: string)=> void, feedback: (message: string, type: Variant)=> void ) => {
  const [topic, setTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(false);

  if (!id){
    navigate("/");
  }

  useEffect(() => {
    async function fetchTopic() {
      setLoading(true);
      try {
        if (id) {
          const response = await getTopicById(id);
          if (response.status === 200) {
            setTopic(response.body as Topic);
          } else if (response.status === 404) {
            feedback("The topic doesn't exist.", "error");
            navigate("/");
          } else if (response.status === 403) {
            feedback("You don't have access to this resource.", "error");
            navigate("/")
          }
        } else {
          navigate("/");
        }
      } catch (e) {
        console.log(e);
        feedback("Unexpected error occurred.", "error");
      } finally {
        setLoading(false);
      }
    }
    fetchTopic();
  }, [id]);

  return { topic, loading };
};

export {useFetchTopic};