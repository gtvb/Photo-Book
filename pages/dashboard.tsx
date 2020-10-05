import {
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  Icon,
  Input,
  useToast,
} from "@chakra-ui/core";
import { MdPhotoCamera } from "react-icons/md";
import { ProtectRoute } from "../components/ProtectRoute";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers";
import useSWR from "swr";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { useAuth } from "../hooks/useAuth";
import { AlbumCard } from "../components/AlbumCard";
import { useRouter } from "next/router";

const fetcher = async (url: string, param: string) => {
  const res = await fetch(url + param);

  return res.json();
};

const validationSchema = yup.object({
  title: yup.string().required().min(2),
});

interface Value {
  title: string;
  creatorId: string;
}

function Dashboard() {
  const { handleSubmit, errors, register } = useForm({
    resolver: yupResolver(validationSchema),
  });

  const toast = useToast();
  const router = useRouter();
  const { user, signOut } = useAuth();

  const appUser = user !== null && user;

  const { data, error } = useSWR(
    ["/api/albums/list?id=", appUser.id],
    (url, params) => fetcher(url, params)
  );

  const logout = () => {
    signOut();

    router.push("/");
  };

  const createAlbum = async ({ title }: Value) => {
    const body = JSON.stringify({ title, creatorId: user.id });

    try {
      const response = await fetch("/api/albums/create", {
        method: "POST",
        body,
      });

      if (response.ok) {
        toast({
          title: "Your album was created!",
          description: "Start uploading photos right now!",
          status: "success",
          duration: 3000,
        });
      }
    } catch (error) {
      toast({
        title: "An error ocurred.",
        description: error.message,
        status: "warning",
        duration: 3000,
      });
    }
  };

  if (!data) return <LoadingSpinner />;

  if (error) return <h1>Failed to get data...</h1>;

  return (
    <Flex width={"100vw"} height={"100vh"} flexDir={"column"}>
      <Flex width="full" alignItems={"center"} justifyContent={"space-between"}>
        <Flex padding={"6"} alignItems={"center"} justifyContent={"center"}>
          <Icon as={MdPhotoCamera} color={"blue.500"} size={"42px"} />
        </Flex>

        <Flex alignItems={"center"} justifyContent={"center"} bg="red">
          <Button
            padding={"4"}
            border={0}
            color={"white"}
            borderRadius={"sm"}
            backgroundColor={"blue.500"}
            _hover={{ backgroundColor: "blue.400" }}
          >
            Albums
          </Button>
          <Button
            padding={"4"}
            marginX={"6"}
            border={0}
            borderRadius={"sm"}
            onClick={logout}
          >
            Logout
          </Button>
        </Flex>
      </Flex>

      <Flex
        width="full"
        flexDir={"column"}
        alignItems={"center"}
        justifyContent={"center"}
      >
        <Flex
          flexDir={"column"}
          alignItems={"center"}
          onSubmit={handleSubmit(createAlbum)}
          as="form"
          justifyContent={"center"}
        >
          <Input
            name="title"
            type="input"
            ref={register}
            padding={6}
            margin={8}
            borderRadius={"sm"}
            size={"lg"}
            placeholder={"Album Title"}
          />
          <Button
            padding={6}
            border={0}
            borderRadius={"sm"}
            color={"white"}
            backgroundColor={"blue.500"}
            _hover={{ backgroundColor: "blue.400" }}
            width={"100%"}
            type="submit"
          >
            Create new Album
          </Button>
        </Flex>
      </Flex>

      <Grid
        paddingTop={8}
        gridTemplateColumns={"repeat(auto-fit, minmax(400px, 1fr))"}
        bg="red"
        maxW={"980px"}
        margin={"auto"}
        width={"90%"}
      >
        {data.map((el) => (
          <AlbumCard albumData={el} key={el.title} />
        ))}
      </Grid>
    </Flex>
  );
}

export default ProtectRoute(Dashboard);
