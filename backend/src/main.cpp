#include "HttpServer.hpp"
#include <iostream>
#include <csignal>

static bool g_keepRunning = true;

void signalHandler(int signum) {
    std::cout << "\n[C++ Backend] Interrupt signal (" << signum << ") received. Shutting down...\n";
    g_keepRunning = false;
}

int main(int argc, char* argv[]) {
    std::signal(SIGINT, signalHandler);
    std::signal(SIGTERM, signalHandler);

    int port = 8080;
    if (argc > 1) {
        try {
            port = std::stoi(argv[1]);
        } catch (...) {
            port = 8080;
        }
    }

    std::cout << "Starting LLM Context Optimizer C++ Engine...\n";

    llm_opt::HttpServer server(port);
    if (!server.init()) {
        std::cerr << "Failed to initialize server on port " << port << "\n";
        return 1;
    }

    std::cout << "Server initialized successfully. Listening for API calls.\n";

    while (g_keepRunning) {
        server.serveOnce(200);
    }

    server.stop();
    std::cout << "LLM Context Optimizer Backend stopped cleanly.\n";
    return 0;
}
